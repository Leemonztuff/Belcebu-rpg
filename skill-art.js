// Standalone branch icons; source art, prompts and slice coords live in art/skills/.
const SkillArt = (() => {
    const families = {
    "fireball": [
        "explosion",
        "burn",
        "meteor",
        "nova",
        "spread",
        "detonate"
    ],
    "thunder": [
        "chain",
        "shock",
        "storm",
        "overload",
        "torture",
        "shield"
    ],
    "multishot": [
        "pierce",
        "spread",
        "rain",
        "snipe",
        "barrage",
        "split"
    ],
    "holy_shield": [
        "reflect",
        "guard",
        "retribution",
        "fortress",
        "angel",
        "link"
    ]
};
    const definitions = Object.fromEntries(Object.entries(families).map(([skill, nodes]) => [skill,
        Object.fromEntries(nodes.map(node => [node, `art/skills/${skill}-${node}.png`]))
    ]));
    const installed = new WeakSet();
    function applyIcon(sprite, skill, node) {
        const file = definitions[skill]?.[node];
        if (!file) throw new Error(`Skill branch missing dedicated icon: ${skill}/${node}`);
        const key = `${skill}/${node}`;
        if (sprite.dataset.skillArt === key) return;
        sprite.style.backgroundImage = `url("${file}?v=2026090602")`;
        sprite.style.backgroundSize = 'contain';
        sprite.style.backgroundPosition = 'center';
        sprite.dataset.skillArt = key;
    }
    function refresh(root = document.getElementById('skill-tree-content')) {
        if (!root) return;
        for (const node of root.querySelectorAll('.skill-tree-node[data-skill][data-node]')) {
            if (node.dataset.stage === '1') continue;
            applyIcon(node.querySelector('.skill-sprite'), node.dataset.skill, node.dataset.node);
        }
// Even without a stage-2 pick, every ultimate route preview shows its own icon.
        for (const branch of root.querySelectorAll('.skill-tree-branch[data-skill]')) {
            const skill = branch.dataset.skill;
            const options = Object.values(SKILL_TREE[skill].stage3).flatMap(route => Object.entries(route));
            for (const preview of branch.querySelectorAll('.skill-route-option')) {
                if (preview.querySelector('.skill-route-art')) continue;
                const name = preview.querySelector('strong').textContent;
                const entry = options.find(([, option]) => option.name === name);
                if (!entry) throw new Error(`Skill path preview mismatch: ${skill}/${name}`);
                const icon = document.createElement('span');
                icon.className = 'skill-route-art';
                icon.setAttribute('aria-hidden', 'true');
                applyIcon(icon, skill, entry[0]);
                preview.prepend(icon);
            }
        }
    }
    function install() {
        const root = document.getElementById('skill-tree-content');
        if (!root || installed.has(root)) return;
        installed.add(root);
        new MutationObserver(() => refresh(root)).observe(root, { childList: true, subtree: true });
        refresh(root);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
    else install();
    return { definitions, refresh, install };
})();
