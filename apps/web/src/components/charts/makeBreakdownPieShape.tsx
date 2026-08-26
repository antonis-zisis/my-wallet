import { type PieSectorShapeProps, Sector } from 'recharts';

import { formatMoneyOrMask } from '../../utils/formatMoney';

const RADIAN = Math.PI / 180;

type ChartDataItem = {
  name: string;
  value: number;
  fill: string;
};

type BreakdownPieShapeOptions = {
  isAmountsHidden: boolean;
  isCompact: boolean;
  labelColor: string;
};

export function makeBreakdownPieShape({
  isAmountsHidden,
  isCompact,
  labelColor,
}: BreakdownPieShapeOptions) {
  return function renderShape({
    cx,
    cy,
    endAngle,
    fill,
    innerRadius,
    isActive,
    midAngle,
    outerRadius,
    payload,
    percent,
    startAngle,
    value,
  }: PieSectorShapeProps) {
    if (!isActive) {
      return (
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      );
    }

    const item = payload as unknown as ChartDataItem;
    const formattedValue = `${formatMoneyOrMask(value ?? 0, isAmountsHidden)} €`;
    const formattedPercent = `(${((percent ?? 0) * 100).toFixed(1)}%)`;

    const activeSectors = (
      <>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />

        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={(outerRadius ?? 0) + 6}
          outerRadius={(outerRadius ?? 0) + 10}
          fill={fill}
        />
      </>
    );

    if (isCompact) {
      return (
        <g>
          {activeSectors}

          <text
            x={cx}
            y={cy}
            dy={-8}
            textAnchor="middle"
            fill={fill}
            fontSize={12}
            fontWeight={500}
          >
            {item.name}
          </text>

          <text
            x={cx}
            y={cy}
            dy={10}
            textAnchor="middle"
            fill={labelColor}
            fontSize={13}
            fontWeight={600}
          >
            {formattedValue}
          </text>

          <text
            x={cx}
            y={cy}
            dy={26}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={11}
          >
            {formattedPercent}
          </text>
        </g>
      );
    }

    const sin = Math.sin(-RADIAN * (midAngle ?? 0));
    const cos = Math.cos(-RADIAN * (midAngle ?? 0));
    const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
    const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
    const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
    const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          fill={fill}
          fontSize={13}
          fontWeight={500}
        >
          {item.name}
        </text>

        {activeSectors}

        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />

        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill={labelColor}
          fontSize={13}
          fontWeight={600}
        >
          {formattedValue}
        </text>

        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#6b7280"
          fontSize={12}
        >
          {formattedPercent}
        </text>
      </g>
    );
  };
}
