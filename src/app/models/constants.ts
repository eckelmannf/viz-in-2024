import { isNumber, isUndefined } from "lodash-es";

export const genderColorMap: Record<string, string> = { 'Männer': '#5470c6', 'Frauen': '#91cc75', 'Gesamt': '#03284c' };
export const genderShadowMap: Record<string, string> = { 'Männer': 'rgba(84, 112, 198, .45)', 'Frauen': 'rgba(145, 204, 117, .45)', 'Gesamt': 'rgb(3, 40, 76, .45)' }

export const getGenderColor = (gender: string): string | undefined => {
    return (gender in genderColorMap ? genderColorMap[gender] : undefined);
}
export const getGenderShadow = (gender: string): string | undefined => {
    return (gender in genderShadowMap ? genderShadowMap[gender] : undefined);
}

export const percentValueFormatter = (value: any) => !isUndefined(value) && isNumber(value) ? `${value.toFixed(1)}%` : value;