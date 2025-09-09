# Task Selection Request

You are an AI assistant helping to select the most appropriate task to work on from a Vibe Kanban board.

## Project Context
**Project Name:** {{PROJECT_NAME}}
**Project Description:** {{PROJECT_DESCRIPTION}}

## Available TODO Tasks
{{TASK_LIST}}

## Selection Criteria
Please analyze the available tasks and select the most appropriate one to work on based on:

1. **Priority**: Tasks that seem more critical or foundational
2. **Dependencies**: Tasks that might block other work
3. **Complexity**: Balance between too simple and too complex
4. **Value**: Tasks that deliver the most value to the project
5. **Clarity**: Tasks with clear requirements and scope

## Instructions
1. Review all available tasks
2. Consider the selection criteria
3. Choose ONE task that should be worked on next
4. Provide a brief explanation for your choice

## Response Format
Please respond with:
1. Your reasoning for the selection (2-3 sentences)
2. The selected task ID in the following format:

SELECTED_TASK_ID: [exact-task-id-here]

Note: Please ensure you copy the exact task ID from the list above. Only select tasks that are in TODO status.