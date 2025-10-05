# Quickstart: Documentation for Dummies Agent

**Date**: 2025-10-03
**Phase**: 1 - Design & Contracts
**Related**: [plan.md](./plan.md), [spec.md](./spec.md)

## Purpose

This quickstart guide provides manual testing scenarios to validate the Documentation for Dummies agent meets all functional requirements and acceptance criteria. Per constitution, this is an MVP with no automated tests - all validation is manual.

## Prerequisites

- [x] Implementation complete (all tasks from tasks.md)
- [x] TypeScript compilation passes: `pnpm tsc --noEmit` shows zero errors
- [x] Dev server starts: `pnpm dev` runs without errors
- [x] Browser: Chrome, Firefox, Safari, or Edge (modern version)
- [x] Context7 MCP server configured and accessible

## Environment Setup

1. **Start Development Server**:
   ```bash
   cd /Users/dwaynejoseph/Projects/D4D
   pnpm dev
   ```
   Expected output: `Ready on http://localhost:3000`

2. **Verify Context7 MCP Connection**:
   - Check console logs for MCP connection status
   - Expected: `✅ Context7 MCP client connected`
   - If error: Verify `CONTEXT7_MCP_URL` in `.env.local`

3. **Open Browser**:
   - Navigate to `http://localhost:3000`
   - Open DevTools Console (F12) to monitor logs

---

## Test Scenarios

### Scenario 1: Simple Technical Question

**Validates**: FR-001, FR-002, FR-003, FR-010, FR-013

**Steps**:
1. Navigate to homepage
2. Click "Documentation for Dummies Agent" link
3. In chat input, type: **"What does API mean?"**
4. Press Enter or click Send

**Expected Results**:
- ✅ Agent retrieves documentation via Context7 MCP
  - Console shows: `🔍 Retrieving documentation for: "API definition"`
  - Console shows: `✅ Documentation retrieved successfully`
- ✅ Response appears in beginner-friendly language
  - Avoids unexplained jargon
  - Includes real-world analogy (e.g., "like a menu at a restaurant")
- ✅ Response includes practical example
  - Example demonstrates API usage simply
- ✅ Code example provided (if relevant to question)
  - Syntax-highlighted code block
  - Clear explanation before/after code

**Pass Criteria**:
- Explanation understandable to someone with no programming background
- No technical terms used without explanation
- At least one real-world analogy or example
- Response tone is friendly and conversational

---

### Scenario 2: Follow-Up Question (Context Maintenance)

**Validates**: FR-005, FR-006, FR-009

**Steps**:
1. Continue from Scenario 1 (do not refresh page)
2. Type: **"Can you give me a simpler example?"**
3. Send message

**Expected Results**:
- ✅ Agent understands context (knows "example" refers to API explanation)
- ✅ Response provides even more simplified explanation
  - More basic analogy
  - Shorter sentences
  - Less technical detail
- ✅ Previous messages visible in conversation history
- ✅ No new documentation retrieval needed (uses context from previous response)
  - Console does NOT show new MCP call unless absolutely necessary

**Pass Criteria**:
- Agent correctly interprets "simpler" in context of previous explanation
- New explanation is genuinely simpler than first attempt
- Conversation flows naturally (no repetition of intro phrases like "An API is...")

---

### Scenario 3: Multi-Part Concept (Step-by-Step Breakdown)

**Validates**: FR-004, FR-014

**Steps**:
1. Start new conversation or refresh page
2. Type: **"What is a REST API and how does it work?"**
3. Send message

**Expected Results**:
- ✅ Agent breaks down explanation into clear steps:
  1. What REST means
  2. What an API is (if not previously explained)
  3. How REST APIs work
  4. Example of REST API in action
- ✅ Each step builds on previous one (progressive disclosure)
- ✅ Agent uses multiple simplification approaches:
  - Analogies (e.g., "REST API is like ordering food...")
  - Examples (e.g., "When you check weather on your phone...")
  - Step-by-step breakdown
- ✅ Code example shows simple REST API call

**Pass Criteria**:
- Response structured with clear sections or numbered steps
- Each concept explained before being used in next explanation
- No assumption of prior knowledge

---

### Scenario 4: Vague Question (Clarification Request)

**Validates**: FR-001, Acceptance Scenario 5

**Steps**:
1. Type: **"Explain programming"**
2. Send message

**Expected Results**:
- ✅ Agent asks clarifying questions, such as:
  - "Are you interested in learning about a specific programming language?"
  - "What aspect of programming would you like to understand?"
  - "Are you trying to understand what programming is, or how to start learning?"
- ✅ Tone remains friendly and helpful
- ✅ Provides general overview while asking for specifics

**Pass Criteria**:
- Agent doesn't attempt to write a novel about all of programming
- Clarifying questions are specific and actionable
- User feels guided toward a more specific question

---

### Scenario 5: Documentation Unavailable

**Validates**: FR-010, FR-014, Edge Case handling

**Steps**:
1. Type a question about an obscure or non-existent topic: **"What is XylofloxDB?"**
2. Send message

**Expected Results**:
- ✅ Agent attempts to retrieve documentation via Context7
  - Console shows: `🔍 Retrieving documentation for: "XylofloxDB"`
  - Console shows: `⚠️ No documentation found for: "XylofloxDB"`
- ✅ Tool result shows `available: false`
- ✅ Agent response informs user clearly:
  - "I don't have documentation for XylofloxDB in my available resources."
  - "This might be a very new or specialized tool/technology."
- ✅ Agent offers alternatives:
  - "Can you provide more context about where you encountered this term?"
  - OR attempts best-effort explanation based on general knowledge (if appropriate)

**Pass Criteria**:
- User clearly understands documentation was unavailable
- No hallucinated or fabricated technical details
- Response is helpful despite lack of documentation

---

### Scenario 6: Code Example Request

**Validates**: FR-013

**Steps**:
1. Type: **"Show me how to make an HTTP request in JavaScript"**
2. Send message

**Expected Results**:
- ✅ Agent retrieves relevant documentation
- ✅ Response includes code example:
  ```javascript
  // Simple fetch example
  fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data));
  ```
- ✅ Code is syntax-highlighted in UI
- ✅ Explanation before code: "Here's how you can make an HTTP request in JavaScript using fetch:"
- ✅ Explanation after code: "This code sends a request to a URL and logs the response data."
- ✅ Code is accurate and runnable

**Pass Criteria**:
- Code example is present (not just conceptual explanation)
- Code is simple and beginner-appropriate (no advanced patterns)
- Explanations make it clear what each line does

---

### Scenario 7: Session-Only History (No Persistence)

**Validates**: FR-011

**Steps**:
1. Complete Scenario 1 (ask about APIs)
2. Verify conversation history shows user question + agent response
3. **Refresh the browser page** (F5 or Cmd+R)
4. Check conversation area

**Expected Results**:
- ✅ Conversation history is cleared
- ✅ Chat interface shows empty state (no messages)
- ✅ Input is ready for new question
- ✅ No localStorage or sessionStorage contains messages
  - Verify in DevTools: Application → Storage

**Pass Criteria**:
- Complete fresh start after refresh (no message persistence)
- No errors in console after refresh
- Agent behaves identically to first load

---

### Scenario 8: Multiple Follow-Ups (Context Retention)

**Validates**: FR-005, FR-006

**Steps**:
1. Ask: **"What is a database?"**
2. Wait for response
3. Ask: **"What's the difference between SQL and NoSQL?"**
4. Wait for response
5. Ask: **"Which one should I use for a blog?"**

**Expected Results**:
- ✅ Each response builds on previous context
- ✅ Third question correctly understood as "which type of database" (not "which blog platform")
- ✅ Agent maintains topic continuity across all 3 exchanges
- ✅ No need to repeat "database" in each question

**Pass Criteria**:
- Natural conversation flow (agent "remembers" topic is databases)
- Responses are coherent as a sequence, not isolated Q&As
- Final answer provides specific recommendation for blog use case

---

## Acceptance Criteria Checklist

**From spec.md Acceptance Scenarios**:

- [ ] **AS-1**: Plain language question → beginner-friendly explanation with real-world examples
- [ ] **AS-2**: Follow-up question → more simplified explanation
- [ ] **AS-3**: Complex concept → step-by-step breakdown with progressive complexity
- [ ] **AS-4**: Technical terminology in question → terms clarified in simple language first
- [ ] **AS-5**: Vague question → agent asks clarifying questions

**Functional Requirements Validated**:

- [ ] **FR-001**: Accepts conversational plain language (no technical terminology required)
- [ ] **FR-002**: Assumes beginner-level knowledge, avoids unexplained jargon
- [ ] **FR-003**: Includes practical, real-world examples
- [ ] **FR-004**: Breaks down complex concepts into steps
- [ ] **FR-005**: Supports multi-turn conversations
- [ ] **FR-006**: Maintains context across conversation turns
- [ ] **FR-007**: Simplifies technical terms before main explanation
- [ ] **FR-008**: Conversational, friendly tone (like a helpful friend)
- [ ] **FR-009**: Allows requests for additional simplification
- [ ] **FR-010**: Uses Context7 MCP for documentation, informs when unavailable
- [ ] **FR-011**: Session-only history (cleared on tab close)
- [ ] **FR-012**: Handles any technical domain (programming, databases, DevOps, etc.)
- [ ] **FR-013**: Includes code examples when explaining programming concepts
- [ ] **FR-014**: Always attempts simplification, uses multiple approaches

---

## Performance Validation

**From plan.md Performance Goals**:

- [ ] **Streaming starts**: First token appears < 500ms after send
  - Measure in DevTools Network tab → Time to First Byte
- [ ] **Documentation retrieval**: MCP call completes < 2s
  - Check console timestamps: `🔍 Retrieving` → `✅ Retrieved`
- [ ] **UI responsiveness**: Typing in input has < 100ms lag
  - Subjective feel test - should feel instant

---

## Error Handling Validation

**Edge Cases**:

- [ ] **Advanced topic simplification**: Agent attempts best effort (Scenario 5)
- [ ] **Vague question**: Agent asks clarifying questions (Scenario 4)
- [ ] **Documentation unavailable**: Agent informs user clearly (Scenario 5)
- [ ] **Multiple unrelated questions**: (Optional test - should handle gracefully)
- [ ] **Out-of-scope question**: (Optional test - should redirect to technical topics)

---

## TypeScript & Code Quality

**Constitution Requirements**:

- [ ] `pnpm tsc --noEmit` → Zero errors
- [ ] `pnpm dev` → Starts without errors or warnings
- [ ] Browser console → No React warnings or errors during normal usage
- [ ] Network tab → All API requests return 200 OK (no 4xx/5xx)

---

## Sign-Off

**Tester**: _________________
**Date**: _________________

**All Scenarios Passed**: ☐ Yes ☐ No (if no, document failures below)

**Notes**:
- Document any failures or unexpected behaviors
- Note browser/OS if issues are environment-specific
- Include console errors verbatim

---

## Next Steps After Validation

✅ **If all tests pass**:
1. Feature is complete and ready for use
2. Update README.md with agent description (if creating standalone repo)
3. Consider adding more test scenarios for edge cases discovered during use

⚠️ **If tests fail**:
1. Document failures in plan.md Complexity Tracking
2. Create targeted tasks to fix specific issues
3. Re-run failing scenarios after fixes
4. Do NOT proceed to deployment until all critical scenarios pass

---

*This quickstart validates all requirements from spec.md and ensures constitutional compliance (TypeScript safety, AI SDK patterns, manual testing for MVP).*
