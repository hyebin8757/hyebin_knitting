import { css, cx, injectGlobal } from "@emotion/css";

/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const ColorStyle = {
  Default : css`
    :root[dark-data=true] {
      --white-color: #303030;
      --black-color: #FFFFFF;
    }

    :root {
      /** primary color **/
      --primary-color: #0c2034;
      --primary-darken-color-1: #2366B4;
      --primary-lighten-color-1: #88C5FF;
      --primary-lighten-color-2: #F0F8FF;
      --primary-lighten-color-3: #15293c;

      /** secondary color **/
      --secondary-darken-color-1: #F99500;
      --secondary-darken-color-2: #FFB526;
      --secondary-lighten-color-1: #FFC727;
      --secondary-lighten-color-2: #FFFBEE;

      /** default color **/
      --white-color: #FFFFFF;
      --black-color: #303030;
      --gray-color : #C2C2C2;

      /** gradation color **/
      --gradation-color-1: linear-gradient(75deg, rgba(12,32,52,1) 10%, rgba(33,51,57,1) 24%, rgba(12,32,52,1) 100%);

      /** text color **/
      --text-color-1: #404040;
      --text-color-2: #555555;
      --text-color-3: #808080;
      --text-color-4: #BABABA;
      --text-color-5: #414141;

      /** disabled color **/
      --disabled-bg-color-1: #E7E7E7;
      --disabled-bg-color-2: #F1F1F1;

      /** border color **/
      --border-color-1: #DDDDDD;
      --border-color-2: #ECEDEF;

      /** system color **/
      --system-blue-color: #464EE8;
      --system-red-color: #E13C3C;
      --system-red-darken-color: #691109;
      --system-red-lighten-color: #f19489;
      --system-green-color: #1BC569;
      --system-green-darken-color: #2d691a;
      --system-green-lighten-color: #86f37e;
      --system-yellow-color: #f3be4f;
      --system-yellow-darken-color: #8f591d;

      /** background color **/
      --background-color-1: #F5F5F5;
      --background-color-2: #EDEDED;
      --background-color-3: #D4EAFF;
      --background-color-4: #FFF4D4;

    }


  `,
}

/************************************************************
 * media style
 ************************************************************/
const MediaStyle = {
  Media : {
    /** [ 1280px ] */
    1280 : css`

    `,

    /** [ 1024px ] */
    1024 : css`
  
    `,

    /** [ 768px ] */
    768 : css`
      
    `,

    /** [ 640px ] */
    640 : css`
      
    `,

    /** [ 450px ] */
    450 : css `
   
    `
  },
}

/************************************************************
 * global style
 ************************************************************/
const GlobalStyle = {

}

injectGlobal`
  ${cx(
  )}
`;


/************************************************************
 * style override
 ************************************************************/