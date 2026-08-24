<script lang="ts">
  import { type Agent, type Role, extractRoles, filterAgents, getCryptoRandom, pickRandomAgent } from "../../lib/core/valorant";
  import { sfx } from "../../lib/core/audio";
  import { useIntlayer } from "svelte-intlayer";

  let { agents = [], isLocaleLoading = false } = $props<{
    agents: Agent[];
    isLocaleLoading?: boolean;
  }>();

  const content = useIntlayer("SpinWheel");

  // State
  let selectedRoles = $state<Set<Role>>(new Set());
  let isSpinning = $state(false);
  let winner = $state<Agent | null>(null);

  // Wheel Physics State
  let wheelRotation = $state(0);
  let transitionDuration = $state(0);
  let isPointerWobbling = $state(false);

  // Derived
  let availableAgents = $derived(filterAgents(agents, selectedRoles));
  let totalCount = $derived(availableAgents.length);
  let sliceAngle = $derived(totalCount > 0 ? 360 / totalCount : 360);
  let roleOptions = $derived(extractRoles(agents));
  /** Dynamic icon sizing depending on density */
  let iconSize = $derived(totalCount > 18 ? 44 : totalCount > 10 ? 50 : 58);

  let conicGradient = $derived.by(() => {
    if (totalCount === 0) {
      return "#1f2326";
    }
    const gap = totalCount > 4 ? 0.4 : 0;
    return availableAgents
      .map((agent, i) => {
        const startDeg = i * sliceAngle;
        const endDeg = (i + 1) * sliceAngle;
        return `${agent.color} ${startDeg}deg ${endDeg - gap}deg, rgba(0,0,0,0.85) ${endDeg - gap}deg ${endDeg}deg`;
      })
      .join(", ");
  });

  $effect(() => {
    if (agents) {
      winner = null;
    }
  });

  function toggleRole(role: Role) {
    if (isSpinning || isLocaleLoading) {
      return;
    }
    const next = new Set(selectedRoles);
    if (next.has(role)) {
      next.delete(role);
    } else {
      next.add(role);
    }
    selectedRoles = next;
  }

  function spin() {
    if (totalCount === 0 || isSpinning || isLocaleLoading) {
      return;
    }

    const result = pickRandomAgent(availableAgents, winner?.id);
    if (!result) {
      return;
    }

    const { winner: selectedWinner, index: winnerIndex } = result;

    isSpinning = true;
    winner = null;
    transitionDuration = 0;

    // Organic offset within slice bounds (15% to 85% width)
    const margin = 0.35;
    const sliceVariation = (getCryptoRandom() - 0.5) * (sliceAngle * margin);
    const sliceCenterAngle = winnerIndex * sliceAngle + sliceAngle / 2;
    const targetSliceAngle = (sliceCenterAngle + sliceVariation) % 360;

    // Full rotations
    const fullSpins = (6 + Math.floor(getCryptoRandom() * 4)) * 360;
    const targetAngle = 360 - targetSliceAngle;

    const currentMod = wheelRotation % 360;
    let adjustment = targetAngle - currentMod;
    if (adjustment < 0) {
      adjustment += 360;
    }

    const startRotation = wheelRotation;
    const newTotalRotation = startRotation + fullSpins + adjustment;
    const duration = 5.2;

    let lastSliceIndex = Math.floor(startRotation / sliceAngle);
    let lastTickTime = 0;
    const minTickInterval = 55; // ms
    const startTime = performance.now();

    function animateTicks(now: number) {
      const elapsed = Math.min((now - startTime) / (duration * 1000), 1);

      if (elapsed < 1 && isSpinning) {
        // Quartic ease-out curve matching CSS cubic-bezier(0.16, 1, 0.3, 1)
        const progress = 1 - Math.pow(1 - elapsed, 4);
        const currentRotation = startRotation + (newTotalRotation - startRotation) * progress;
        const currentSliceIndex = Math.floor(currentRotation / sliceAngle);
        const nowMs = performance.now();

        if (currentSliceIndex > lastSliceIndex && nowMs - lastTickTime >= minTickInterval) {
          lastSliceIndex = currentSliceIndex;
          lastTickTime = nowMs;

          const speedFactor = Math.pow(1 - elapsed, 3);
          sfx.playTick(speedFactor);

          isPointerWobbling = true;
          setTimeout(() => (isPointerWobbling = false), 35);
        }

        requestAnimationFrame(animateTicks);
      }
    }

    setTimeout(() => {
      transitionDuration = duration;
      wheelRotation = newTotalRotation;
      requestAnimationFrame(animateTicks);
    }, 20);

    setTimeout(
      () => {
        isSpinning = false;
        winner = selectedWinner;
        sfx.playWin();
      },
      duration * 1000 + 60,
    );
  }
</script>

<div class="container">
  <div class="wheel-wrapper">
    <div class="pointer" class:wobble={isPointerWobbling}></div>

    <div
      class="wheel"
      style:background={`conic-gradient(${conicGradient})`}
      style:transform={`rotate(${wheelRotation}deg)`}
      style:transition={`transform ${transitionDuration}s cubic-bezier(0.16, 1, 0.3, 1)`}
      style:--icon-size={`${iconSize}px`}
    >
      {#each availableAgents as agent, i (agent.id)}
        <div class="slice-content" style:transform={`rotate(${i * sliceAngle + sliceAngle / 2}deg) translateY(-195px)`}>
          <img src={agent.icon || agent.image || agent.portrait} alt={agent.name} class="slice-agent-img" loading="eager" />
        </div>
      {/each}
    </div>

    <div class="hub" class:has-winner={!!winner && !isSpinning} style:--winner-color={winner?.color}>
      {#if winner && !isSpinning}
        <div class="winner-container">
          <img src={winner.portrait || winner.image || winner.icon} alt={winner.name} class="winner-img" />
        </div>
      {:else}
        <div class="hub-placeholder">
          <svg class="hub-logo" fill="#000000" viewBox="0 0 32 32">
            <path
              d="M19.8,26.1h-0.2c-2.4,0-4.8,0-7.2,0c-0.3,0-0.5-0.1-0.6-0.3c-2.5-3.2-5.1-6.3-7.6-9.5C4.1,16.1,4,16,4,15.8c0-3.1,0-6.1,0-9.2c0-0.1,0-0.2,0.1-0.2h0.1c5.2,6.5,10.4,13,15.5,19.5c0,0,0,0.1,0.1,0.1L19.8,26.1z"
            />
            <path
              d="M27.8,16.3c-0.7,0.9-1.5,1.8-2.2,2.8c-0.2,0.2-0.4,0.3-0.6,0.3c-2.4,0-4.8,0-7.1,0c0,0-0.1,0-0.1,0c-0.1,0-0.2-0.1-0.1-0.2c0,0,0-0.1,0.1-0.1c2.4-3,4.7-5.9,7.1-8.9c1-1.2,2-2.5,2.9-3.7c0-0.1,0.1-0.1,0.2-0.1c0,0,0.1,0,0.1,0c0,0.1,0,0.1,0,0.2c0,3,0,6.1,0,9.1C28,16,27.9,16.2,27.8,16.3z"
            />
          </svg>
          <span class="hub-status">{isSpinning ? $content.wheel.spinning : $content.wheel.idle}</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="controls">
    <!-- Role Filters -->
    <div class="filters">
      {#each roleOptions as role}
        <button class:active={selectedRoles.has(role)} onclick={() => toggleRole(role)} disabled={isSpinning || isLocaleLoading}>
          {role}
        </button>
      {/each}
    </div>

    <!-- Spin Action Button -->
    <button
      class="spin-btn"
      class:tooltip-active={!!winner && !isSpinning}
      data-tooltip={$content.action.spinAgain}
      onclick={spin}
      disabled={isSpinning || isLocaleLoading || totalCount === 0}
      style:background={winner && !isSpinning ? winner.color : undefined}
      style:text-shadow={winner && !isSpinning ? "0 2px 6px rgba(0,0,0,0.9)" : undefined}
    >
      {#if isLocaleLoading}
        {$content.loader.spin}
      {:else if isSpinning}
        ...
      {:else if winner}
        {winner.name.toUpperCase()}
      {:else}
        {$content.action.spin}
      {/if}
    </button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
  }

  .wheel-wrapper {
    position: relative;
    width: 540px;
    height: 540px;
    max-width: 90vw;
    max-height: 90vw;
    display: flex;
    justify-content: center;
    align-items: center;
    filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.7));
  }

  .pointer {
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-top: 38px solid #ff4655;
    z-index: 20;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.6));
    transform-origin: 50% 0%;
    transition: transform 0.035s ease-out;
  }

  .pointer.wobble {
    transform: translateX(-50%) rotate(-14deg) scale(1.06);
  }

  .wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    border: 8px solid #1f2326;
    box-sizing: border-box;
    box-shadow: inset 0 0 45px rgba(0, 0, 0, 0.95);
    will-change: transform;
  }

  .slice-content {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    z-index: 2;
    pointer-events: none;
  }

  .slice-agent-img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--icon-size, 50px);
    height: var(--icon-size, 50px);
    min-width: var(--icon-size, 50px);
    min-height: var(--icon-size, 50px);
    max-width: none;
    object-fit: contain;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.9));
    pointer-events: none;
    user-select: none;
  }

  .hub {
    position: absolute;
    width: 220px;
    height: 220px;
    max-width: 43%;
    max-height: 43%;
    background: #0f1923;
    border: 6px solid #ece8e1;
    border-radius: 50%;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0, 0, 0, 1);
    transition:
      box-shadow 0.4s ease,
      border-color 0.4s ease;
  }

  .hub.has-winner {
    border-color: var(--winner-color, #ff4655);
    box-shadow: 0 0 40px var(--winner-color, #ff4655);
  }

  .hub-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #444;
  }

  .hub-logo {
    width: 65px;
    height: 65px;
    fill: #333;
    transition: fill 0.3s;
  }

  .hub:hover .hub-logo {
    fill: #ff4655;
  }

  .hub-status {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 3px;
    margin-top: 6px;
  }

  .winner-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #111;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .winner-img {
    width: 125%;
    height: 125%;
    object-fit: cover;
  }

  @keyframes popIn {
    0% {
      transform: scale(0.6);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .controls {
    width: 100%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
  }

  .filters {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filters button {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid #444;
    color: #bbb;
    padding: 0.65rem 1.05rem;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: 700;
    text-transform: uppercase;
    transition: 0.2s;
    border-radius: 4px;
  }

  .filters button.active {
    background: #ff4655;
    border-color: #ff4655;
    color: white;
    box-shadow: 0 0 16px rgba(255, 70, 85, 0.4);
  }

  .spin-btn {
    width: 100%;
    background: #ff4655;
    color: white;
    border: none;
    padding: 1.25rem;
    font-size: 1.7rem;
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
    transition:
      transform 0.1s,
      background-color 0.3s;
    position: relative;
  }

  .spin-btn:active {
    transform: scale(0.98);
  }

  .spin-btn:disabled {
    background: #25282c !important;
    color: #555 !important;
    cursor: not-allowed;
  }

  .spin-btn.tooltip-active:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 12px;
    background: #0f1923;
    color: #fff;
    padding: 6px 14px;
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 1px;
    border: 1px solid #555;
    white-space: nowrap;
    pointer-events: none;
    border-radius: 4px;
    z-index: 100;
  }
</style>
