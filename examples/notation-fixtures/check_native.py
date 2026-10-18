"""Check native behavior preservation; no viewer or engineering acceptance claim."""
import argparse
import json
from pathlib import Path
import subprocess


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def check_bundle(bundle):
    views = {view['id']: view['native'] for view in bundle['views']}
    action = views['actions']
    nodes = {node['id']: node for node in action['nodes']}
    labels = {edge['label'] for edge in action['edges']}
    require({'[guardEnabled]', '[not guardEnabled]'} <= labels, 'guard labels lost')
    fork = next(n['id'] for n in nodes.values() if n['kind'] == 'fork')
    join = next(n['id'] for n in nodes.values() if n['kind'] == 'join')
    require(sum(e['from_id'] == fork for e in action['edges']) == 2, 'fork must split into two branches')
    require(sum(e['to_id'] == join for e in action['edges']) == 2, 'join must retain both branches')
    state = views['states']
    states = {n['semantic_id']: n for n in state['nodes'] if n.get('semantic_id')}
    parent = states['DeskFan__operating__active']['id']
    for child in ('accelerating', 'steady'):
        require(states['DeskFan__operating__active__' + child]['parent'] == parent, 'composite state boundary lost')
    sequence = views['sequence']
    require([e['semantic_id'] for e in sequence['edges']] == [
        'DeskFan__StartupExchange__request', 'DeskFan__StartupExchange__selfCheck',
        'DeskFan__StartupExchange__ready'], 'native message order lost')
    middle = sequence['edges'][1]
    require(middle['from_id'] == middle['to_id'], 'self-message became a cross-participant message')
    matrix = views['matrix']
    cells = {(r['cells'][0], col): cell for r in matrix['rows']
             for col, cell in zip(matrix['columns'][1:], r['cells'][1:])}
    for source, target, relation in [
        ('DeskFan::controlled', 'DeskFan::guardedStart', 'derive'),
        ('DeskFan::fan', 'DeskFan::controlled', 'satisfy'),
        ('DeskFan::GuardCheck', 'DeskFan::guardedStart', 'verify'),
        ('DeskFan::startCycle', 'DeskFan::controller', 'allocate')]:
        require(cells.get((source, target)) == relation, f'{relation} direction or membership lost')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cli', required=True)
    parser.add_argument('--bundle', help='Optional freshly exported candidate bundle')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    subprocess.run([args.cli, str(root/'model.sysml'), '-strict', '-validate'], check=True)
    rendered = {}
    for view in json.loads((root/'project.json').read_text())['views']:
        result = subprocess.run([args.cli, str(root/'model.sysml'), '-render', view['native'], '-render-form', 'text'],
                                check=True, capture_output=True, text=True)
        require('rendering is empty' not in result.stdout, f"empty {view['id']} rendering")
        rendered[view['id']] = result.stdout
    require('[guardEnabled]' in rendered['actions'] and '[not guardEnabled]' in rendered['actions'], 'guards missing')
    require('fork prepare' in rendered['actions'] and 'join prepared' in rendered['actions'], 'concurrency missing')
    require('start of active -> accelerating' in rendered['states'], 'nested initial state missing')
    seq = rendered['sequence']
    require(seq.index('panel => control: request') < seq.index('control => control: selfCheck') < seq.index('control => panel: ready'), 'message order missing')
    for relation in ('derive', 'satisfy', 'verify', 'allocate'):
        require(relation in rendered['matrix'], relation + ' absent')
    if args.bundle:
        check_bundle(json.loads(Path(args.bundle).read_text()))
    print('Native notation assertions passed; viewer support is not evaluated.')


if __name__ == '__main__':
    main()
