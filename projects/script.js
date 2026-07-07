const workflowData = {
  ap: {
    start: "reviewEmail",
    total: 15,
    nodes: {
      reviewEmail: {
        type: "Start",
        title: "Review Email",
        body: "Open the AP email and review the message contents.",
        why: "This confirms whether the email creates invoice work or can be closed without routing.",
        next: "emailContainsInvoice"
      },
      emailContainsInvoice: {
        type: "Question",
        title: "Does the email contain an invoice?",
        body: "Check whether the email includes an invoice document or enough invoice detail to continue.",
        why: "Only invoice-bearing emails should move into the Zone validation process.",
        options: [
          { label: "Yes", next: "searchZone" },
          { label: "No", next: "emailNoInvoiceEnd" }
        ]
      },
      searchZone: {
        type: "Action",
        title: "Search for the invoice in Zone.",
        body: "Use Zone to look for the invoice before uploading or routing it again.",
        why: "Searching first helps prevent duplicate records and keeps the invoice review trail clean.",
        next: "invoiceInZone"
      },
      invoiceInZone: {
        type: "Question",
        title: "Is it in Zone?",
        body: "Confirm whether the invoice already exists in Zone.",
        why: "Existing Zone invoices can be opened directly for PO and IR validation. Missing invoices need to be sent into Zone.",
        options: [
          { label: "Yes", next: "openInvoice" },
          { label: "No", next: "sendToZoneEnd" }
        ]
      },
      sendToZoneEnd: {
        type: "Final Action",
        title: "Send to Zone via email or manual upload.",
        body: "Route the invoice into Zone, then close this email intake path.",
        why: "Zone must contain the invoice before the AP review can continue.",
        final: true
      },
      emailNoInvoiceEnd: {
        type: "Final Action",
        title: "Review non-invoice email and report to lead AP agent.",
        body: "Determine whether the email is a past due notification, failed payment, or follow-up from a previous conversation. Report the details to the lead AP agent for next steps, then end the workflow.",
        why: "Non-invoice AP messages may still require follow-up, but they should be routed through the lead AP agent instead of the invoice processing path.",
        final: true
      },
      openTracker: {
        type: "Start",
        title: "Open Zone tracker Excel sheet.",
        body: "Begin in the tracker used to manage assigned Zone invoices.",
        why: "The tracker establishes ownership and keeps invoice review work visible.",
        next: "locateInvoice"
      },
      locateInvoice: {
        type: "Action",
        title: "Locate assigned invoice in Zone.",
        body: "Find the invoice assigned to you in the tracker and in Zone.",
        why: "Confirming the assigned invoice reduces the chance of processing the wrong item.",
        next: "openInvoice"
      },
      openInvoice: {
        type: "Action",
        title: "Open invoice.",
        body: "Review the invoice details directly before checking PO and IR status.",
        why: "The invoice is the source for vendor, amount, PO, and routing cues.",
        next: "hasPoOnInvoice"
      },
      hasPoOnInvoice: {
        type: "Question",
        title: "Does it have a PO listed on the invoice?",
        body: "Look at the invoice and determine whether a purchase order number is printed or referenced.",
        why: "The presence of a PO determines whether you validate a specific PO or search the dropdown for possible matches.",
        options: [
          { label: "Yes", next: "openPoDropdownWithPo" },
          { label: "No", next: "openPoDropdownNoPo" }
        ]
      },
      openPoDropdownWithPo: {
        type: "Action",
        title: "Open PO dropdown.",
        body: "Open the PO dropdown for the invoice record in Zone.",
        why: "The dropdown shows whether Zone has the matching PO available for validation.",
        next: "samePoListed"
      },
      samePoListed: {
        type: "Question",
        title: "Is the same PO listed?",
        body: "Compare the PO on the invoice to the PO shown in the dropdown.",
        why: "A mismatch can indicate incomplete setup, wrong routing, or a control issue that needs follow-up.",
        options: [
          { label: "Yes", next: "openPoCheckIr" },
          { label: "No", next: "emailLocationEnd" }
        ]
      },
      openPoCheckIr: {
        type: "Action",
        title: "Open the PO and check whether the IR for the invoice is listed.",
        body: "Open the matching PO and look for the invoice receipt associated with this invoice.",
        why: "The IR confirms receiving support before the invoice is processed.",
        next: "irForInvoiceListed"
      },
      irForInvoiceListed: {
        type: "Question",
        title: "Is the IR for the invoice listed?",
        body: "Confirm whether the invoice receipt appears under the PO.",
        why: "Processing should continue only when the expected IR support is present.",
        options: [
          { label: "Yes", next: "processEnd" },
          { label: "No", next: "emailLocationEnd" }
        ]
      },
      openPoDropdownNoPo: {
        type: "Action",
        title: "Open PO dropdown and check whether any POs are listed.",
        body: "Because no PO appears on the invoice, inspect the dropdown for possible PO records.",
        why: "Available POs may still contain an IR that supports the invoice.",
        next: "anyPosListed"
      },
      anyPosListed: {
        type: "Question",
        title: "Are there POs listed?",
        body: "Review whether the dropdown contains one or more possible POs.",
        why: "If POs exist, each should be checked for an IR before escalating elsewhere.",
        options: [
          { label: "Yes", next: "checkEveryPo" },
          { label: "No", next: "utilityInvoice" }
        ]
      },
      checkEveryPo: {
        type: "Action",
        title: "Go through every PO and check whether there is an IR listed for the invoice.",
        body: "Open each available PO and search for the invoice receipt.",
        why: "Checking every listed PO helps avoid unnecessary escalation when support exists under a different PO.",
        next: "irListedNoPoPath"
      },
      irListedNoPoPath: {
        type: "Question",
        title: "Is there an IR listed for the invoice?",
        body: "Confirm whether any checked PO contains the invoice receipt.",
        why: "An IR allows the invoice to move forward even when the invoice itself did not show a PO.",
        options: [
          { label: "Yes", next: "processEnd" },
          { label: "No", next: "emailLocationEnd" }
        ]
      },
      utilityInvoice: {
        type: "Question",
        title: "Is it a utility invoice?",
        body: "Determine whether the invoice is for a utility service.",
        why: "Utility invoices follow a special filing path when no PO is listed.",
        options: [
          { label: "Yes", next: "saveUtilityEnd" },
          { label: "No", next: "emailProcurementEnd" }
        ]
      },
      processEnd: {
        type: "Final Action",
        title: "Process.",
        body: "The invoice has the required support. Process the invoice and end the workflow.",
        why: "Validated PO and IR support gives AP the control evidence needed to proceed.",
        final: true
      },
      emailLocationEnd: {
        type: "Final Action",
        title: "Email invoice location contact.",
        body: "Ask the location contact to resolve the missing PO match or missing IR.",
        why: "The location contact is the owner for local invoice receiving and follow-up details.",
        final: true
      },
      saveUtilityEnd: {
        type: "Final Action",
        title: "Save copy to utility invoices folder.",
        body: "File the utility invoice copy in the utility invoices folder and end the workflow.",
        why: "Utility invoices need to be retained in the designated folder for review and processing support.",
        final: true
      },
      emailProcurementEnd: {
        type: "Final Action",
        title: "Email Procurement.",
        body: "Escalate the non-utility invoice with no PO listed to Procurement.",
        why: "Procurement can help resolve missing purchasing support before AP processes the invoice.",
        final: true
      }
    }
  }
};

const exceptions = [
  {
    title: "No invoice",
    tag: "Email intake",
    means: "The email does not contain an invoice document or usable invoice detail.",
    matters: "The message may still require AP attention even though it does not belong in the invoice processing path.",
    next: "Determine whether the email is a past due notification, failed payment, or follow-up from a previous conversation. Report the details to the lead AP agent for next steps.",
    template: "Hello, this email does not contain an invoice. I am reviewing whether it is a past due notification, failed payment, or follow-up from a previous conversation and will report it to the lead AP agent for next steps."
  },
  {
    title: "Invoice not in Zone",
    tag: "Zone routing",
    means: "The invoice was found in email but does not already exist in Zone.",
    matters: "Invoices must be available in Zone before PO and IR review can continue.",
    next: "Send the invoice to Zone by email or manual upload."
  },
  {
    title: "No PO listed",
    tag: "PO validation",
    means: "The invoice does not show a purchase order number.",
    matters: "Without a PO, AP needs another way to confirm purchasing support or determine the correct escalation.",
    next: "Open the PO dropdown and check whether any POs are listed."
  },
  {
    title: "PO mismatch",
    tag: "PO validation",
    means: "The PO on the invoice is not the same as the PO listed in Zone.",
    matters: "A mismatch may point to incorrect routing, missing setup, or invoice support that does not match the order.",
    next: "Email the invoice location contact for clarification.",
    template: "Hello, the PO shown on this invoice does not match the PO available in Zone. Can you confirm the correct PO or next action?"
  },
  {
    title: "Missing IR",
    tag: "IR review",
    means: "The expected invoice receipt is not listed for the invoice.",
    matters: "The IR is receiving support that helps confirm the goods or services were received.",
    next: "Email the invoice location contact and request IR support or confirmation.",
    template: "Hello, I reviewed the PO for this invoice but do not see the related IR listed. Can you review and advise?"
  },
  {
    title: "Utility invoice",
    tag: "Special handling",
    means: "The invoice is for utility services and no PO is listed.",
    matters: "Utility invoices follow a designated filing path rather than the standard PO/IR route.",
    next: "Save a copy to the utility invoices folder."
  },
  {
    title: "Procurement escalation",
    tag: "Escalation",
    means: "A non-utility invoice has no PO listed and no usable PO path in Zone.",
    matters: "Procurement may need to resolve purchasing support before AP can continue.",
    next: "Email Procurement with the invoice details.",
    template: "Hello Procurement team, this non-utility invoice has no PO listed and no PO path available in Zone. Please review and advise."
  },
  {
    title: "Location contact follow-up",
    tag: "Escalation",
    means: "The workflow requires clarification from the invoice location owner.",
    matters: "Location contacts can confirm PO accuracy, receiving status, or missing IR details.",
    next: "Email the location contact with the invoice number, vendor, PO details, and the specific blocker.",
    template: "Hello, can you help resolve this invoice exception? Blocker: [missing PO match / missing IR]. Invoice: [invoice number]. Vendor: [vendor]."
  }
];

const glossary = [
  ["Excel", "Spreadsheet tool used to open and manage the Zone tracker where assigned invoices are monitored."],
  ["Zone", "Invoice workflow system used to locate invoices, review PO dropdowns, and validate processing readiness."],
  ["NetSuite", "Accounting and ERP system commonly used for financial records, vendor activity, and AP processing support."],
  ["PO", "Purchase order. A purchasing document that links an invoice to approved buying activity."],
  ["IR", "Invoice receipt. Receiving support used to confirm the invoice can move forward for processing."],
  ["Utility invoice", "Invoice for utility services that follows a special folder-saving path when no PO is listed."],
  ["Procurement", "Team responsible for purchasing support and escalation when PO information is missing or incomplete."],
  ["Location contact", "Operational contact who can clarify PO, receiving, or IR issues for a specific invoice location."]
];

const metrics = [
  ["Invoices reviewed", "248", "92", "Total invoices reviewed this sample period."],
  ["Missing PO rate", "14%", "14", "Share of reviewed invoices without a PO listed."],
  ["Missing IR rate", "18%", "18", "Share of reviewed invoices where IR support was missing."],
  ["Utility invoices", "31", "31", "Utility invoices routed to the designated folder."],
  ["Procurement escalations", "12", "12", "Invoices sent to Procurement for missing purchasing support."],
  ["Average resolution time", "1.8 days", "72", "Average time to clear workflow exceptions."],
  ["Processed invoices", "196", "79", "Invoices processed after PO and IR validation."]
];

const weeklyOutcomes = [
  ["Processed", 196],
  ["Location follow-up", 28],
  ["Utility folder", 31],
  ["Procurement", 12],
  ["Sent to Zone", 21]
];

const state = {
  ap: { current: workflowData.ap.start, start: workflowData.ap.start, history: [], learning: true, quick: false }
};

function getNode(workflowKey) {
  return workflowData[workflowKey].nodes[state[workflowKey].current];
}

function renderWorkflow(workflowKey) {
  const currentState = state[workflowKey];
  const node = getNode(workflowKey);
  const isFinal = Boolean(node.final);
  const visitedCount = currentState.history.length + 1;
  const progress = isFinal ? 100 : Math.min(96, Math.round((visitedCount / workflowData[workflowKey].total) * 100));
  const card = document.querySelector(`[data-workflow="${workflowKey}"] .step-card`);

  document.querySelector(`[data-step-type="${workflowKey}"]`).textContent = node.type;
  document.querySelector(`[data-step-title="${workflowKey}"]`).textContent = node.title;
  document.querySelector(`[data-step-body="${workflowKey}"]`).textContent = currentState.quick ? "" : node.body;
  document.querySelector(`[data-learning-note="${workflowKey}"]`).textContent =
    currentState.learning && !currentState.quick ? `Why it matters: ${node.why}` : "";
  document.querySelector(`[data-progress-label="${workflowKey}"]`).textContent = isFinal ? "Complete" : `Step ${visitedCount}`;
  document.querySelector(`[data-progress-percent="${workflowKey}"]`).textContent = `${progress}%`;
  document.querySelector(`[data-progress-bar="${workflowKey}"]`).style.width = `${progress}%`;

  card.classList.toggle("is-final", isFinal);
  renderActions(workflowKey, node);
  renderBreadcrumb(workflowKey);
  document.querySelector(`[data-back="${workflowKey}"]`).disabled = currentState.history.length === 0;
}

function renderActions(workflowKey, node) {
  const actions = document.querySelector(`[data-actions="${workflowKey}"]`);
  actions.innerHTML = "";

  if (node.options) {
    node.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "button primary";
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", () => goToNode(workflowKey, option.next));
      actions.appendChild(button);
    });
    return;
  }

  if (node.next) {
    const button = document.createElement("button");
    button.className = "button primary";
    button.type = "button";
    button.textContent = "Continue";
    button.addEventListener("click", () => goToNode(workflowKey, node.next));
    actions.appendChild(button);
    return;
  }

  const finalBadge = document.createElement("span");
  finalBadge.className = "button secondary";
  finalBadge.textContent = "Workflow complete";
  actions.appendChild(finalBadge);
}

function renderBreadcrumb(workflowKey) {
  const breadcrumb = document.querySelector(`[data-breadcrumb="${workflowKey}"]`);
  const titles = [...state[workflowKey].history, state[workflowKey].current].map((nodeKey) => workflowData[workflowKey].nodes[nodeKey].title);
  breadcrumb.innerHTML = titles.map((title) => `<span title="${title}">${title}</span>`).join("");
}

function goToNode(workflowKey, nextNode) {
  state[workflowKey].history.push(state[workflowKey].current);
  state[workflowKey].current = nextNode;
  renderWorkflow(workflowKey);
}

function setWorkflowStart(workflowKey, startNode) {
  state[workflowKey].start = startNode;
  state[workflowKey].current = startNode;
  state[workflowKey].history = [];
  document.querySelectorAll(`.start-selector [data-workflow="${workflowKey}"]`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.startNode === startNode);
  });
  renderWorkflow(workflowKey);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => showToast("Copied to clipboard."),
    () => showToast("Copy failed. Select the text and copy it manually.")
  );
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function renderExceptions(filter = "") {
  const grid = document.getElementById("exceptionGrid");
  const normalized = filter.trim().toLowerCase();
  const matches = exceptions.filter((item) => Object.values(item).join(" ").toLowerCase().includes(normalized));

  grid.innerHTML = matches
    .map(
      (item, index) => `
        <article class="glass-card info-card">
          <span class="tag">${item.tag}</span>
          <h3>${item.title}</h3>
          <p><strong>What it means:</strong> ${item.means}</p>
          <p><strong>Why it matters:</strong> ${item.matters}</p>
          <p><strong>Recommended next step:</strong> ${item.next}</p>
          ${
            item.template
              ? `<div class="template-box">${item.template}</div><button class="button secondary copy-template" type="button" data-template-index="${index}">Copy email template</button>`
              : ""
          }
        </article>
      `
    )
    .join("");

  document.querySelectorAll("[data-template-index]").forEach((button) => {
    button.addEventListener("click", () => copyText(matches[Number(button.dataset.templateIndex)].template));
  });
}

function renderGlossary() {
  document.getElementById("glossaryGrid").innerHTML = glossary
    .map(
      ([term, description]) => `
        <article class="glass-card info-card">
          <span class="tag">AP term</span>
          <h3>${term}</h3>
          <p>${description}</p>
        </article>
      `
    )
    .join("");
}

function renderDashboard() {
  document.getElementById("metricGrid").innerHTML = metrics
    .map(
      ([label, value, percent, description]) => `
        <article class="glass-card metric-card">
          <h3>${label}</h3>
          <span class="metric-value">${value}</span>
          <div class="mini-track" aria-hidden="true"><span style="width:${percent}%"></span></div>
          <p>${description}</p>
        </article>
      `
    )
    .join("");

  const maxValue = Math.max(...weeklyOutcomes.map(([, value]) => value));
  document.getElementById("barChart").innerHTML = weeklyOutcomes
    .map(
      ([label, value]) => `
        <div class="bar-row">
          <span class="bar-label">${label}</span>
          <div class="bar-track"><span style="width:${Math.round((value / maxValue) * 100)}%"></span></div>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");
}

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => {
    const workflowKey = button.dataset.back;
    const previous = state[workflowKey].history.pop();
    if (previous) {
      state[workflowKey].current = previous;
      renderWorkflow(workflowKey);
    }
  });
});

document.querySelectorAll("[data-restart]").forEach((button) => {
  button.addEventListener("click", () => {
    const workflowKey = button.dataset.restart;
    state[workflowKey].current = state[workflowKey].start || workflowData[workflowKey].start;
    state[workflowKey].history = [];
    renderWorkflow(workflowKey);
  });
});

document.querySelectorAll("[data-start-node]").forEach((button) => {
  button.addEventListener("click", () => {
    setWorkflowStart(button.dataset.workflow, button.dataset.startNode);
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => {
    const workflowKey = button.dataset.copy;
    const node = getNode(workflowKey);
    copyText(`${node.title} ${node.body}`.trim());
  });
});

document.querySelectorAll("[data-workflow-toggle]").forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const workflowKey = toggle.dataset.workflowToggle;
    state[workflowKey][toggle.dataset.toggle] = toggle.checked;
    renderWorkflow(workflowKey);
  });
});

document.getElementById("exceptionSearch").addEventListener("input", (event) => {
  renderExceptions(event.target.value);
});

document.querySelector(".nav-toggle").addEventListener("click", (event) => {
  const nav = document.getElementById("navLinks");
  const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
  event.currentTarget.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("is-open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("navLinks").classList.remove("is-open");
    document.querySelector(".nav-toggle").setAttribute("aria-expanded", "false");
  });
});

renderWorkflow("ap");
renderExceptions();
renderGlossary();
renderDashboard();
