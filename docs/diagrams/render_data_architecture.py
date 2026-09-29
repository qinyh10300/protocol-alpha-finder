"""Render the historical-evidence cycle using nested research containers."""
from pathlib import Path
from svg_diagram import Diagram

ROOT = Path(__file__).resolve().parent
LABELS = {
    'en': {
        'title': 'From Historical Evidence to New Alpha',
        'subtitle': 'Find proven executors, then study their next actions for new mechanisms.',
        'history': 'Historical Evidence',
        'sources': [
            ('Contract calls', 'Functions and execution order'),
            ('Receipts & event logs', 'Successful actions and executors'),
            ('Asset movements', 'Token transfers and execution fees'),
            ('Protocol state', 'Conditions at the time of execution'),
        ],
        'input': 'Transaction evidence + context',
        'workflow': 'Research Workflow',
        'scope': 'Repeat for each wallet',
        'stages': [
            ('01', 'Analyze executions', [
                'Match known seed actions',
                'Trace calls and asset flows',
                'Compare repeated executions',
            ]),
            ('02', 'Strategy Wallets', [
                'Identify the actual executor',
                'Keep seed and transaction evidence',
                'Extend research beyond the seed',
            ]),
            ('03', 'Observe new activity', [
                'Review new contracts and calls',
                'Compare with earlier behavior',
                'Recheck protocol conditions',
            ]),
            ('04', 'Alpha Candidates', [
                'Explain the possible mechanism',
                'Attach executions and costs',
                'State how to test the claim',
            ]),
        ],
        'validation': 'Validate evidence, costs, and current conditions',
        'reports': 'A report for every candidate',
        'alpha': 'New Alpha, if supported',
        'return': 'Established mechanism → new seed',
        'solid': 'Evidence and research results',
        'dashed': 'Conditional next research round',
        'note': 'Observation means repeated collection and review. Current checks are started manually.',
    },
    'zh-CN': {
        'title': '从历史证据找到新的 Alpha',
        'subtitle': '先找到已知机制的真实执行者，再从他们的新操作中寻找其他机制。',
        'history': '历史证据',
        'sources': [
            ('合约调用', '调用函数与执行顺序'),
            ('交易回执与事件日志', '成功执行的操作与真实执行者'),
            ('资产流动', '代币转移与执行费用'),
            ('协议状态', '操作发生时的协议条件'),
        ],
        'input': '交易证据与执行背景',
        'workflow': '研究流程',
        'scope': '对每个钱包重复研究',
        'stages': [
            ('01', '分析历史执行', [
                '匹配已知 Seed 的操作',
                '还原调用过程与资产流动',
                '比较重复发生的执行记录',
            ]),
            ('02', '策略钱包', [
                '识别真正执行操作的钱包',
                '保留 Seed 与对应交易证据',
                '研究原始 Seed 之外的行为',
            ]),
            ('03', '观察新增活动', [
                '读取新合约与新调用记录',
                '与钱包已有历史行为对比',
                '重新检查协议的当前条件',
            ]),
            ('04', 'Alpha 候选', [
                '说明可能成立的收益机制',
                '附上执行记录与成本估计',
                '写出检验这一判断的方法',
            ]),
        ],
        'validation': '检验交易证据、执行成本与当前协议条件',
        'reports': '每个候选都有一份报告',
        'alpha': '验证支持后形成新的 Alpha',
        'return': '已确认的机制 → 新的 Seed',
        'solid': '证据与研究结果的流向',
        'dashed': '满足条件后继续下一轮研究',
        'note': '观察指重复采集与复查钱包活动；当前工作流由手动启动这些检查。',
    },
}


def render(lang, labels):
    d = Diagram(1800, 1130, labels['title'], labels['subtitle'], lang)
    flow = '#657e94'
    feedback = '#769789'
    d.parts.append(f'''<defs>
<marker id="evidence-head" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="{flow}" stroke-width="1.7"/></marker>
<marker id="feedback-head" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="{feedback}" stroke-width="1.7"/></marker>
</defs>''')

    def path(route, kind='evidence-flow', dashed=False):
        color, marker = (feedback, 'feedback-head') if dashed else (flow, 'evidence-head')
        dash = ' stroke-dasharray="7 6"' if dashed else ''
        d.parts.append(f'<path data-kind="{kind}" d="{route}" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#{marker})"{dash}/>')

    d.text(40, 58, labels['title'], 'title')
    d.text(40, 99, labels['subtitle'], 'body')

    # One source scope makes the four evidence types read as a related dataset.
    d.rect(40, 145, 1720, 205, '#f8fafc', '#c8d3df', 8)
    d.text(65, 184, labels['history'], 'heading')
    for x, (title, detail) in zip([65, 500, 935, 1370], labels['sources']):
        d.rect(x, 214, 365, 107, '#ffffff', '#cbd6e1', 8)
        d.text(x + 182.5, 256, title, 'node', 'middle')
        d.text(x + 182.5, 290, detail, 'body', 'middle')

    path('M 900 351 L 900 430', 'historical-evidence-input')
    d.text(925, 397, labels['input'], 'body')

    # A single workflow contains the transformations, rather than six loose cards.
    d.rect(40, 440, 1720, 340, '#f8fbfa', '#bdcfc5', 8)
    d.text(65, 484, labels['workflow'], 'heading')
    d.text(1735, 484, labels['scope'], 'body', 'end')
    for x, (number, title, lines) in zip([65, 500, 935, 1370], labels['stages']):
        d.rect(x, 525, 365, 205, '#ffffff', '#c9d5dd', 8)
        d.text(x + 21, 564, number, 'small', color='#6b8797')
        d.text(x + 63, 564, title, 'node')
        d.line(x + 20, 586, x + 345, 586, '#e1e8eb')
        for index, line in enumerate(lines):
            d.text(x + 182.5, 622 + index * 34, line, 'body', 'middle')
    for x1, x2 in [(440, 490), (875, 925), (1310, 1360)]:
        path(f'M {x1} 628 L {x2} 628')

    # Every candidate receives a report; only supported mechanisms return as seeds.
    path('M 1552.5 731 L 1552.5 860', 'candidate-validation')
    d.rect(990, 870, 770, 148, '#f1f7f3', '#afc8b8', 8)
    d.text(1014, 911, labels['validation'], 'node')
    d.rect(1014, 937, 332, 55, '#ffffff', '#cad9d0', 8)
    d.rect(1364, 937, 372, 55, '#e6f1e9', '#bad1c2', 8)
    d.text(1180, 971, labels['reports'], 'body', 'middle')
    d.text(1550, 971, labels['alpha'], 'body', 'middle', '#38654f')

    # The return edge denotes a conditional research step, not an automated service.
    path('M 980 944 H 813 Q 800 944 800 931 V 828 Q 800 815 787 815 H 260 Q 247.5 815 247.5 802 V 740', 'established-mechanism-return', True)
    d.text(490, 802, labels['return'], 'small', 'middle', '#5d7d6e')

    path('M 40 1060 H 100')
    d.text(117, 1066, labels['solid'], 'small')
    path('M 495 1060 H 555', 'legend-feedback', True)
    d.text(572, 1066, labels['dashed'], 'small')
    d.text(40, 1103, labels['note'], 'small')
    d.save(ROOT.parent / 'images' / f'data-architecture-{lang}.svg')

    # The Mermaid companion keeps the same groups and conditional return semantics.
    m = ['flowchart TB', f'    subgraph HISTORY["{labels["history"]}"]', '        direction LR']
    for index, (title, detail) in enumerate(labels['sources']):
        m.append(f'        E{index}["{title}<br/>{detail}"]')
    m.extend(['    end', f'    subgraph WORKFLOW["{labels["workflow"]}"]', '        direction LR'])
    for index, (number, title, lines) in enumerate(labels['stages']):
        content = '<br/>'.join([f'{number} {title}', *lines])
        m.append(f'        N{index}["{content}"]')
        if index:
            m.append(f'        N{index-1} --> N{index}')
    m.extend(['    end', '    HISTORY --> WORKFLOW', f'    V["{labels["validation"]}"]', '    N3 --> V', f'    R["{labels["reports"]}"]', f'    A["{labels["alpha"]}"]', '    V --> R', '    V --> A', f'    A -. "{labels["return"]}" .-> N0', f'    %% {labels["note"]}'])
    (ROOT / f'data-architecture-{lang}.mmd').write_text('\n'.join(m) + '\n')


if __name__ == '__main__':
    for language, content in LABELS.items():
        render(language, content)
