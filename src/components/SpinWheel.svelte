<script lang="ts">
  import { type Agent, type Role, filterAgents, pickRandom } from "../lib/core/valorant";

  let { allAgents } = $props<{ allAgents: Agent[] }>();

  // --- State ---
  let selectedRoles = $state<Set<Role>>(new Set());
  let isSpinning = $state(false);
  let winner = $state<Agent | null>(null);

  // Animation State
  let wheelRotation = $state(0);
  let transitionSec = $state(0);

  // --- Derived ---
  let availableAgents = $derived(filterAgents(allAgents, selectedRoles));
  let sliceAngle = $derived(360 / (availableAgents.length || 1));

  let conicGradient = $derived.by(() => {
    if (availableAgents.length === 0) return "#333";
    const gap = availableAgents.length > 4 ? 0.5 : 0;
    return availableAgents
      .map((agent, i) => {
        const startDeg = i * sliceAngle;
        const endDeg = (i + 1) * sliceAngle;
        return `${agent.color}dd ${startDeg}deg ${endDeg - gap}deg, rgba(0,0,0,0.8) ${endDeg - gap}deg ${endDeg}deg`;
      })
      .join(", ");
  });

  // --- Logic ---
  function toggleRole(role: Role) {
    if (isSpinning) return;
    const next = new Set(selectedRoles);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    selectedRoles = next;
  }

  function spin() {
    if (availableAgents.length === 0 || isSpinning) return;

    const selectedWinner = pickRandom(availableAgents);
    if (!selectedWinner) return;

    isSpinning = true;
    winner = null;

    transitionSec = 0;

    const winnerIndex = availableAgents.findIndex((a) => a.id === selectedWinner.id);
    const winnerStaticAngle = winnerIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = 360 - winnerStaticAngle;
    const minSpins = 5 * 360;
    const baseTarget = wheelRotation + minSpins;
    const currentRemainder = baseTarget % 360;
    let adjustment = targetAngle - currentRemainder;
    if (adjustment < 0) adjustment += 360;

    const newTotalRotation = baseTarget + adjustment;

    setTimeout(() => {
      transitionSec = 5;
      wheelRotation = newTotalRotation;
    }, 20);

    setTimeout(() => {
      isSpinning = false;
      winner = selectedWinner;
    }, 5050);
  }
</script>

<div class="container">
  <div class="wheel-wrapper">
    <div class="pointer"></div>

    <div
      class="wheel"
      style:background={`conic-gradient(${conicGradient})`}
      style:transform={`rotate(${wheelRotation}deg)`}
      style:transition={`transform ${transitionSec}s cubic-bezier(0.15, 0.8, 0.1, 1)`}
    >
      {#each availableAgents as agent, i}
        <div class="slice-content" style:transform={`rotate(${i * sliceAngle + sliceAngle / 2}deg) translateY(-200px)`}>
          <img src={agent.imgUrl} alt={agent.name} />
        </div>
      {/each}
    </div>

    <div class="hub">
      {#if winner && !isSpinning}
        <div class="winner-container">
          <img src={winner.imgUrl} alt={winner.name} class="winner-img" />
        </div>
      {:else}
        <div class="hub-placeholder">
          <svg class="hub-logo" fill="#000000" viewBox="0 0 32 32">
            <g>
              <path
                d="M19.8,26.1h-0.2c-2.4,0-4.8,0-7.2,0c-0.3,0-0.5-0.1-0.6-0.3c-2.5-3.2-5.1-6.3-7.6-9.5C4.1,16.1,4,16,4,15.8   c0-3.1,0-6.1,0-9.2c0-0.1,0-0.2,0.1-0.2h0.1c5.2,6.5,10.4,13,15.5,19.5c0,0,0,0.1,0.1,0.1L19.8,26.1L19.8,26.1z"
              />
              <path
                d="M27.8,16.3c-0.7,0.9-1.5,1.8-2.2,2.8c-0.2,0.2-0.4,0.3-0.6,0.3c-2.4,0-4.8,0-7.1,0c0,0-0.1,0-0.1,0c-0.1,0-0.2-0.1-0.1-0.2   c0,0,0-0.1,0.1-0.1c2.4-3,4.7-5.9,7.1-8.9c1-1.2,2-2.5,2.9-3.7c0-0.1,0.1-0.1,0.2-0.1c0,0,0.1,0,0.1,0c0,0.1,0,0.1,0,0.2   c0,3,0,6.1,0,9.1C28,16,27.9,16.2,27.8,16.3L27.8,16.3z"
              />
            </g>
          </svg>
          <span class="hub-status">{isSpinning ? "GIRANDO" : "VAP"}</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="controls">
    <div class="filters">
      {#each ["Duelista", "Controlador", "Sentinela", "Iniciador"] as role}
        <button class:active={selectedRoles.has(role as Role)} onclick={() => toggleRole(role as Role)} disabled={isSpinning}>
          {role}
        </button>
      {/each}
    </div>

    <button
      class="spin-btn"
      class:tooltip-active={!!winner && !isSpinning}
      onclick={spin}
      disabled={isSpinning || availableAgents.length === 0}
      style:background={winner && !isSpinning ? winner.color : undefined}
      style:text-shadow={winner && !isSpinning ? "0 2px 4px rgba(0,0,0,0.8)" : undefined}
    >
      {#if isSpinning}
        ...
      {:else if winner}
        {winner.name.toUpperCase()}
      {:else}
        GIRAR
      {/if}
    </button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    padding-top: 1rem;
    width: 100%;
  }

  .wheel-wrapper {
    position: relative;
    width: 550px;
    height: 550px;
    max-width: 95vw;
    max-height: 95vw;
    display: flex;
    justify-content: center;
    align-items: center;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6));
  }

  .pointer {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 40px solid #ff4655;
    z-index: 20;
    filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.5));
  }

  .wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    border: 8px solid #1f2326;
    box-sizing: border-box;
    box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.9);
    will-change: transform;
  }

  .slice-content {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .slice-content img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8));
  }

  .hub {
    position: absolute;
    width: 240px;
    height: 240px;
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
  }

  .hub-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #444;
  }

  .hub-logo {
    width: 80px;
    height: 80px;
    fill: #333;
    margin-bottom: 0.5rem;
    transition: fill 0.3s;
  }

  .hub:hover .hub-logo {
    fill: #ff4655;
  }
  .hub-status {
    font-size: 1.2rem;
    font-weight: bold;
    letter-spacing: 4px;
    margin-top: 10px;
  }

  .winner-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #111;
  }

  .winner-img {
    width: 120%;
    height: 120%;
    object-fit: cover;
  }

  .controls {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .filters {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    flex-wrap: wrap;
  }

  .filters button {
    background: transparent;
    border: 1px solid #555;
    color: #aaa;
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    transition: 0.2s;
  }

  .filters button.active {
    background: #ff4655;
    border-color: #ff4655;
    color: white;
    box-shadow: 0 0 15px rgba(255, 70, 85, 0.4);
  }

  .spin-btn {
    background: #ff4655;
    color: white;
    border: none;
    padding: 1.5rem;
    font-size: 2rem;
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
    transition:
      transform 0.1s,
      background-color 0.3s;
    position: relative;
  }
  .spin-btn:active {
    transform: scale(0.98);
  }
  .spin-btn:disabled {
    background: #333 !important;
    color: #555 !important;
    cursor: not-allowed;
    transform: none;
  }

  .spin-btn.tooltip-active:hover::after {
    content: "CLICK TO SPIN AGAIN";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 15px;
    background: #0f1923;
    color: #fff;
    padding: 8px 16px;
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 1px;
    border: 1px solid #555;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .spin-btn.tooltip-active:hover::before {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 9px;
    border-width: 6px;
    border-style: solid;
    border-color: #0f1923 transparent transparent transparent;
    z-index: 100;
  }
</style>
