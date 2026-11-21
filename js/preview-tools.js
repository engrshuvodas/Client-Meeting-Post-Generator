'use strict';

window.PreviewTools = (function() {
  const templates = {
    meeting: ['Meeting', [
      ['Client country / region', 'countryLabelInput', 'The client’s country from the conversation.'],
      ['Headline · White', 'meetingTitle', 'Name the subject of the meeting.'],
      ['Headline · Mint', 'meetingTitleAccent', 'Complete the headline with a short emphasized phrase. Avoid repeating the white part.'],
      ['Caption', 'meetingCaption', 'Summarize the discussion or an agreed next step.']
    ]],
    chat: ['Chat', [
      ['Client country / region', null, 'The client’s country, if stated.'],
      ['Headline · White', 'chatHeadline', 'Describe what the exchange confirms. Use an order or review headline only if the conversation supports it.'],
      ['Headline · Mint', 'chatHeadlineAccent', 'Complete the headline with a short emphasized phrase. Avoid repeating the white part.']
    ]],
    casestudy: ['Case Study', [
      ['Project category / domain', 'csCategory', 'Identify the type of project.'],
      ['Main headline', 'csHeadline', 'Name the concrete problem or improvement.'],
      ['The Challenge', 'csChallenge', 'Explain the client’s original problem and its impact.'],
      ['The Solution', 'csSolution', 'Describe the actions taken. Distinguish proposed work from completed work.']
    ]],
    project: ['Project', [
      ['Project name', 'projectTitle', 'Use the supplied name or a short descriptive title.'],
      ['Project category', 'projectType', 'Identify the kind of deliverable.'],
      ['Technologies', 'projectTechInput', 'List only documented tools, separated by commas.'],
      ['Short description', 'projectDesc', 'Explain who the project serves and what it does.']
    ]],
    service: ['Service', [
      ['Service category', 'serviceName', 'Name the service discussed.'],
      ['Main headline', 'serviceHeadline', 'Connect the service to a specific client need.'],
      ['Service overview', 'serviceDesc', 'Describe the work and who it helps.'],
      ...[1, 2, 3].map(n => ['Benefit ' + n, 'benefit' + n, 'One distinct, supported benefit or deliverable.'])
    ]],
    tip: ['Tip', [
      ['Category', 'tipCategory', 'Name the practical topic.'],
      ['Key principle / title', 'tipHeadline', 'Write one clear, actionable takeaway.'],
      ['Insight & explanation', 'tipInsight', 'Explain how to apply it, using relevant details from my notes.']
    ]]
  };
  let active = 'meeting';

  function select(id) {
    if (!Object.hasOwn(templates, id)) return;
    active = id;
    document.getElementById('copyPrompt').textContent = 'Copy ' + templates[id][0] + ' prompt';
  }

  function promptFor(id) {
    const [title, fields] = templates[id];
    const outline = fields.map(([label, input, hint]) => {
      const limit = input ? document.getElementById(input).maxLength : 0;
      return label + '\n[' + hint + (limit > 0 ? ' Maximum ' + limit + ' characters.' : '') + ']';
    }).join('\n\n');
    return 'Write the copy for my ' + title + ' social post using the client conversation, screenshots or notes I have already supplied in this chat. If no source material is available, ask me to paste it first.\n\n' +
      'Use my requested post language, or English by default. Write concise, natural copy in my voice. Use only supported details. Do not invent locations, quotes, results or metrics. Omit private client identifiers. For missing facts write [Need: specific detail].\n\n' +
      'Return one version using the exact field labels below, in order. Put each finished value on the line below its label so I can paste it into the editor. Replace the bracketed writing instructions with the copy. Skip introductions, markdown formatting and hashtags.\n\n' + outline;
  }

  function init() {
    const main = document.getElementById('mainCanvas');
    const proof = document.getElementById('postProof');
    const full = document.getElementById('proofCanvas');
    const manual = document.getElementById('manualPrompt');
    const text = document.getElementById('promptText');
    const toast = document.getElementById('copyToast');
    let hideTimer;
    function confirmCopy() {
      clearTimeout(hideTimer);
      toast.hidden = false;
      hideTimer = setTimeout(() => { toast.hidden = true; }, 2600);
    }
    document.getElementById('copyPrompt').addEventListener('click', async () => {
      toast.hidden = true;
      const prompt = promptFor(active);
      try {
        await navigator.clipboard.writeText(prompt);
        confirmCopy();
      } catch {
        manual.showModal();
        text.value = prompt;
        text.focus();
        text.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch {}
        if (copied) { manual.close(); confirmCopy(); }
      }
    });

    let ownsFullscreen = false;
    function openProof() {
      if (proof.open) return;
      full.width = main.width;
      full.height = main.height;
      full.getContext('2d').drawImage(main, 0, 0);
      proof.showModal();
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          ownsFullscreen = true;
          if (!proof.open) document.exitFullscreen().catch(() => {});
        }).catch(() => {});
      }
    }
    main.addEventListener('click', openProof);
    main.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProof(); }
    });
    document.getElementById('closeProof').addEventListener('click', () => proof.close());
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && ownsFullscreen && proof.open) proof.close();
    });
    proof.addEventListener('close', () => {
      if (ownsFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      ownsFullscreen = false;
      main.focus({preventScroll: true});
    });
  }

  return {select, init};
})();
