import {css} from "@emotion/css";

export type flexAlignItemsOption = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export type flexJustifyContentOption = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type flexWrapOption = '' | 'wrap' | 'nowrap' | 'wrap-reverse';
export type flexDirectionOption = '' | 'row' | 'column' | 'row-reverse' | 'column-reverse';

export const FlexUtils = (
  alignItems : flexAlignItemsOption,
  justifyContent : flexJustifyContentOption,
  wrap? : flexWrapOption,
  direction? : flexDirectionOption
) => {
  return css`
      display: flex;
      align-items: ${ alignItems };
      justify-content: ${ justifyContent };
      ${ wrap && `flex-wrap: ${ wrap };` };
      ${ direction && `flex-direction: ${ direction };` }; 
    `
}