(function () {
  /**
   * Vanilla, accessible accordion
   * - Uses buttons with aria-expanded/aria-controls
   * - Panels are role="region" and labelled by their trigger
   * - Supports single-open (default) or multi-open via data-allow-multiple="true"
   * - Animates height while respecting prefers-reduced-motion
   */

  const accordions = document.querySelectorAll(".accordion");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  accordions.forEach((acc) => {
    const allowMultiple = acc.getAttribute("data-allow-multiple") === "true";
    const triggers = acc.querySelectorAll(".accordion__trigger");

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => toggle(btn, acc, allowMultiple));
      // Keyboard niceties: Up/Down to move focus between headers
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const list = Array.from(triggers);
          const idx = list.indexOf(btn);
          const nextIdx = e.key === "ArrowDown" ? (idx + 1) % list.length : (idx - 1 + list.length) % list.length;
          list[nextIdx].focus();
        }
      });
    });
  });

  function toggle(button, root, allowMultiple) {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const panelId = button.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    if (!allowMultiple && !expanded) {
      // Close others
      const openButtons = root.querySelectorAll('.accordion__trigger[aria-expanded="true"]');
      openButtons.forEach((b) => collapse(b, document.getElementById(b.getAttribute("aria-controls"))));
    }

    expanded ? collapse(button, panel) : expand(button, panel);
  }

  function expand(button, panel) {
    button.setAttribute("aria-expanded", "true");
    panel.hidden = false;

    if (prefersReduced) {
      panel.style.blockSize = "auto";
      return;
    }

    // Animate: from 0 to content height
    const contentHeight = panel.scrollHeight;
    panel.style.blockSize = "0px";
    // Force style calc
    panel.getBoundingClientRect();
    panel.style.blockSize = contentHeight + "px";

    const onEnd = (e) => {
      if (e.propertyName !== "block-size") return;
      panel.style.blockSize = "auto";
      panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
  }

  function collapse(button, panel) {
    button.setAttribute("aria-expanded", "false");

    if (prefersReduced) {
      panel.hidden = true;
      panel.style.blockSize = "0px";
      return;
    }

    // From current height to 0
    const contentHeight = panel.scrollHeight;
    panel.style.blockSize = contentHeight + "px";
    // Force style calc
    panel.getBoundingClientRect();
    panel.style.blockSize = "0px";

    const onEnd = (e) => {
      if (e.propertyName !== "block-size") return;
      panel.hidden = true;
      panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
  }
})();
