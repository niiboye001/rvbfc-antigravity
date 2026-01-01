import { Text, TextProps } from 'react-native';
import { useCountingNumber } from '../hooks/useCountingNumber';

interface CountingTextProps extends TextProps {
    value: number;
    duration?: number;
    shouldAnimate?: boolean;
    formatter?: (value: number) => string;
}

export function CountingText({
    value,
    duration = 2000,
    shouldAnimate = true,
    formatter,
    style,
    ...props
}: CountingTextProps) {
    const count = useCountingNumber(value, duration, shouldAnimate);
    const displayValue = formatter ? formatter(count) : count;

    return (
        <Text style={style} {...props}>
            {displayValue}
        </Text>
    );
}
