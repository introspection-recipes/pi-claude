/**
 * Portable Claude Code orchestration tools for the Pi runtime.
 *
 * Claude Code now uses TaskCreate/TaskGet/TaskList/TaskUpdate instead of
 * TodoWrite by default. It also exposes AskUserQuestion for decisions that
 * genuinely require the user. The interaction helpers keep that question
 * portable across Pi's TUI, RPC, headless, and interrupt/resume hosts.
 */

import type {
  ExtensionContext,
  ExtensionFactory,
  ExtensionUIContext,
  ExtensionUIDialogOptions,
} from "@earendil-works/pi-coding-agent";
import {
  askUserApproval,
  askUserQuestion,
  type AskUserOutcome,
} from "@introspection-ai/recipes/interactions";
import { Type, type Static } from "typebox";

const TaskStatus = Type.Union([
  Type.Literal("pending"),
  Type.Literal("in_progress"),
  Type.Literal("completed"),
]);

const TaskCreateParams = Type.Object({
  subject: Type.String({ description: "Brief actionable title in imperative form." }),
  description: Type.String({ description: "Detailed requirements and context." }),
  activeForm: Type.Optional(
    Type.String({ description: "Present-continuous label shown while the task is active." }),
  ),
});

const TaskGetParams = Type.Object({
  taskId: Type.String({ description: "Task ID returned by TaskCreate or TaskList." }),
});

const TaskListParams = Type.Object({});

const TaskUpdateParams = Type.Object({
  taskId: Type.String({ description: "Task ID to update." }),
  status: Type.Optional(Type.Union([TaskStatus, Type.Literal("deleted")])),
  subject: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  activeForm: Type.Optional(Type.String()),
  owner: Type.Optional(Type.String()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  addBlocks: Type.Optional(Type.Array(Type.String())),
  addBlockedBy: Type.Optional(Type.Array(Type.String())),
});

const QuestionOption = Type.Object({
  label: Type.String({ description: "Short option label." }),
  description: Type.String({ description: "What choosing this option changes." }),
  preview: Type.Optional(Type.String({ description: "Optional markdown or HTML preview." })),
});

const AskUserQuestionParams = Type.Object({
  question: Type.String({ description: "The decision or clarification to show the user." }),
  header: Type.String({ description: "Short UI heading (12 characters or fewer).", maxLength: 12 }),
  options: Type.Array(QuestionOption, {
    description: "Two to four suggested answers. The UI also allows custom text.",
    minItems: 2,
    maxItems: 4,
  }),
  multiSelect: Type.Optional(
    Type.Boolean({ description: "Allow the user to choose more than one option." }),
  ),
});

const RequestPlanApprovalParams = Type.Object({
  plan: Type.String({ description: "The complete implementation plan presented for approval." }),
  title: Type.Optional(Type.String({ description: "Short title for the approval card." })),
});

type TaskCreateInput = Static<typeof TaskCreateParams>;
type TaskUpdateInput = Static<typeof TaskUpdateParams>;

type Task = TaskCreateInput & {
  id: string;
  status: Static<typeof TaskStatus>;
  owner?: string;
  metadata: Record<string, unknown>;
  blocks: string[];
  blockedBy: string[];
};

type TaskDetails = { tasks: Task[] };

function reconstructTasks(ctx: ExtensionContext): Task[] {
  let tasks: Task[] = [];
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "message") continue;
    const message = entry.message;
    if (message.role !== "toolResult" || !message.toolName.startsWith("Task")) continue;
    const details = message.details as TaskDetails | undefined;
    if (details?.tasks) tasks = details.tasks;
  }
  return tasks;
}

function renderTask(task: Task): string {
  const owner = task.owner ? ` owner=${task.owner}` : "";
  const blocked = task.blockedBy.length ? ` blockedBy=[${task.blockedBy.join(", ")}]` : "";
  return `${task.id}. [${task.status}] ${task.subject}${owner}${blocked}`;
}

async function multiSelectWalk(
  ui: ExtensionUIContext,
  dialog: ExtensionUIDialogOptions,
  question: string,
  options: Array<{ label: string; description: string }>,
): Promise<AskUserOutcome> {
  const selected: string[] = [];
  const done = "Done selecting";
  const custom = "Other (custom answer)";

  while (true) {
    const remaining = options
      .filter((option) => !selected.includes(option.label))
      .map((option) => option.label);
    const choice = await ui.select(
      selected.length ? `${question}\n\nSelected: ${selected.join(", ")}` : question,
      [...remaining, custom, done],
      dialog,
    );
    if (choice === undefined) return { type: "declined" };
    if (choice === done) {
      return selected.length
        ? { type: "answered", answer: selected.join(", ") }
        : { type: "declined" };
    }
    if (choice === custom) {
      const answer = await ui.input("Answer", "Type another selection", dialog);
      const trimmed = answer?.trim();
      if (trimmed) selected.push(trimmed);
    } else {
      selected.push(choice);
    }
  }
}

const extension: ExtensionFactory = (pi) => {
  let tasks: Task[] = [];
  let nextTaskId = 1;

  const restore = (ctx: ExtensionContext) => {
    tasks = reconstructTasks(ctx);
    nextTaskId =
      tasks.reduce((highest, task) => Math.max(highest, Number(task.id) || 0), 0) + 1;
  };

  pi.on("session_start", async (_event, ctx) => restore(ctx));
  pi.on("session_tree", async (_event, ctx) => restore(ctx));

  pi.registerTool({
    name: "AskUserQuestion",
    label: "Ask user",
    description:
      "Ask the user only when blocked on a decision that cannot be resolved from the request, code, or sensible defaults. The answer must materially change what you do next. Put a recommended option first and suffix its label with '(Recommended)'.",
    promptSnippet: "Ask the user a structured question when a genuine user-owned decision blocks progress.",
    promptGuidelines: [
      "Do not ask for facts you can discover or choices with a conventional default.",
      "The user can always provide custom text; do not add an Other option.",
      "Use RequestPlanApproval, not AskUserQuestion, to approve a completed plan.",
    ],
    parameters: AskUserQuestionParams,
    executionMode: "sequential",
    async execute(toolCallId, params, signal, _onUpdate, ctx) {
      const options = params.options.map((option) => ({
        label: option.label,
        value: option.label,
        description: option.description,
      }));
      return askUserQuestion(
        {
          question: params.question,
          header: params.header,
          options,
          metadata: {
            multiSelect: params.multiSelect ?? false,
            previews: params.options
              .filter((option) => option.preview)
              .map((option) => ({ label: option.label, preview: option.preview })),
          },
        },
        {
          toolCallId,
          ctx,
          signal,
          ...(params.multiSelect
            ? {
                interactive: (ui, dialog) =>
                  multiSelectWalk(ui, dialog, params.question, params.options),
              }
            : {}),
        },
      );
    },
  });

  pi.registerTool({
    name: "RequestPlanApproval",
    label: "Approve plan",
    description:
      "Present a complete implementation plan for user approval. Use this for plan approval; use AskUserQuestion only for earlier clarifications or approach choices.",
    parameters: RequestPlanApprovalParams,
    executionMode: "sequential",
    async execute(toolCallId, params, signal, _onUpdate, ctx) {
      return askUserApproval(
        {
          kind: "plan_approval",
          title: params.title ?? "Implementation plan",
          message: "Approve this implementation plan?",
          body: params.plan,
        },
        { toolCallId, ctx, signal },
      );
    },
  });

  pi.registerTool({
    name: "TaskCreate",
    label: "Create task",
    description:
      "Create a structured task for a complex coding session. Use task tracking for work with three or more distinct steps, multiple user requests, or explicit planning—not for trivial work. Check TaskList first to avoid duplicates.",
    parameters: TaskCreateParams,
    async execute(_toolCallId, params) {
      const task: Task = {
        id: String(nextTaskId++),
        subject: params.subject,
        description: params.description,
        ...(params.activeForm ? { activeForm: params.activeForm } : {}),
        status: "pending",
        metadata: {},
        blocks: [],
        blockedBy: [],
      };
      tasks.push(task);
      return {
        content: [{ type: "text", text: `Created task ${task.id}: ${task.subject}` }],
        details: { tasks: [...tasks] },
      };
    },
  });

  pi.registerTool({
    name: "TaskGet",
    label: "Get task",
    description:
      "Retrieve one task with its full description, status, ownership, metadata, and dependencies.",
    parameters: TaskGetParams,
    async execute(_toolCallId, params) {
      const task = tasks.find((candidate) => candidate.id === params.taskId);
      if (!task) {
        return {
          content: [{ type: "text", text: `Task ${params.taskId} was not found.` }],
          details: { tasks: [...tasks] },
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
        details: { tasks: [...tasks] },
      };
    },
  });

  pi.registerTool({
    name: "TaskList",
    label: "List tasks",
    description:
      "List task summaries and progress. Prefer available tasks in ID order and use TaskGet before updating a task.",
    parameters: TaskListParams,
    async execute() {
      return {
        content: [
          {
            type: "text",
            text: tasks.length ? tasks.map(renderTask).join("\n") : "No tasks.",
          },
        ],
        details: { tasks: [...tasks] },
      };
    },
  });

  pi.registerTool({
    name: "TaskUpdate",
    label: "Update task",
    description:
      "Update task status, details, ownership, metadata, or dependencies. Read the latest task with TaskGet first. Mark a task completed only when its work and verification are fully finished; use deleted to remove an obsolete task.",
    parameters: TaskUpdateParams,
    async execute(_toolCallId, params: TaskUpdateInput) {
      const index = tasks.findIndex((candidate) => candidate.id === params.taskId);
      if (index < 0) {
        return {
          content: [{ type: "text", text: `Task ${params.taskId} was not found.` }],
          details: { tasks: [...tasks] },
          isError: true,
        };
      }

      if (params.status === "deleted") {
        tasks.splice(index, 1);
        for (const task of tasks) {
          task.blocks = task.blocks.filter((id) => id !== params.taskId);
          task.blockedBy = task.blockedBy.filter((id) => id !== params.taskId);
        }
        return {
          content: [{ type: "text", text: `Deleted task ${params.taskId}.` }],
          details: { tasks: [...tasks] },
        };
      }

      const task = tasks[index]!;
      const referencedIds = [...(params.addBlocks ?? []), ...(params.addBlockedBy ?? [])];
      const missing = referencedIds.filter((id) => !tasks.some((candidate) => candidate.id === id));
      if (missing.length) {
        return {
          content: [{ type: "text", text: `Unknown dependency task IDs: ${missing.join(", ")}` }],
          details: { tasks: [...tasks] },
          isError: true,
        };
      }

      if (params.status) task.status = params.status;
      if (params.subject !== undefined) task.subject = params.subject;
      if (params.description !== undefined) task.description = params.description;
      if (params.activeForm !== undefined) task.activeForm = params.activeForm;
      if (params.owner !== undefined) task.owner = params.owner;
      if (params.metadata) {
        for (const [key, value] of Object.entries(params.metadata)) {
          if (value === null) delete task.metadata[key];
          else task.metadata[key] = value;
        }
      }
      task.blocks = [...new Set([...task.blocks, ...(params.addBlocks ?? [])])];
      task.blockedBy = [...new Set([...task.blockedBy, ...(params.addBlockedBy ?? [])])];
      for (const id of params.addBlocks ?? []) {
        const blocked = tasks.find((candidate) => candidate.id === id)!;
        blocked.blockedBy = [...new Set([...blocked.blockedBy, task.id])];
      }
      for (const id of params.addBlockedBy ?? []) {
        const blocker = tasks.find((candidate) => candidate.id === id)!;
        blocker.blocks = [...new Set([...blocker.blocks, task.id])];
      }

      return {
        content: [{ type: "text", text: `Updated task ${task.id}: ${renderTask(task)}` }],
        details: { tasks: [...tasks] },
      };
    },
  });
};

export default extension;
