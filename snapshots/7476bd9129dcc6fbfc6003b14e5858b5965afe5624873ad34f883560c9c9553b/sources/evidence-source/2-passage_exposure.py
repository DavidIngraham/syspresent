"""Plot native constant-hazard passage contours; no candidate rates are estimated.

Run python -m tools.publishing.passage_exposure to regenerate the committed figure.
"""
from tools.boat_analysis.model.runtime import ROOT, analysis_values


def render():
    values = analysis_values('BlueDogPassageExposure::Contours')
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams['svg.hashsalt'] = 'blue-dog-passage-exposure'
    fig, ax = plt.subplots(figsize=(10, 5.6), layout='constrained')
    for percent, style in [(99, ':'), (95, '--'), (90, '-'), (80, '-.')]:
        ax.plot(values['hours'], values[f'rate{percent}'], style, lw=2,
                label=f'{percent}% survival')
    hours, rates = values['exampleHours'], values['exampleRates']
    ax.scatter(hours, rates, color=['#176a65', '#ab4e23'], s=65, zorder=5)
    for i, (label, result) in enumerate([('Slower', 'slowerSurvival'), ('Faster', 'fasterSurvival')]):
        ax.annotate(f'{label}: {values[result]:.1%}\n{hours[i]:g} h, {rates[i]:g}/h',
                    (hours[i], rates[i]), xytext=(12, 22 if i == 0 else 38),
                    textcoords='offset points', fontsize=10,
                    bbox={'facecolor': 'white', 'edgecolor': 'none', 'alpha': .9, 'pad': 2},
                    arrowprops={'arrowstyle': '-', 'color': '#65796d'})
    ax.set(xlim=(12, 96), ylim=(0, .008), xlabel='Total passage exposure (hours, including holds)',
           ylabel='Mission-critical failure rate (per hour)',
           title='A shorter passage can tolerate a higher hourly failure rate')
    ax.grid(alpha=.2)
    ax.legend(loc='upper right', frameon=False)
    fig.text(.5, -.025, 'Illustrative constant-hazard sensitivity · Points are hypothetical designs · Lower is better at a fixed passage time',
             ha='center', fontsize=9)
    target = ROOT / 'docs/figures/passage-reliability.svg'
    fig.savefig(target, bbox_inches='tight', metadata={'Date': None})
    target.write_text('\n'.join(line.rstrip() for line in target.read_text().splitlines())+'\n', encoding='utf-8')
    plt.close(fig)
    return target


if __name__ == '__main__':
    print(render())
