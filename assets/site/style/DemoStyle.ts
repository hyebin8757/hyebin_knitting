import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "@/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
  html[demo=true] {
    .login {
      .demo-log {
        cursor: pointer;
        width: 21rem;
        height: 4rem;
        margin: 0 auto 2rem;
      }  
    }
    
    .header {
      .logo {
        width: 15rem;
        height: 2.5rem;
      }
    }
    
    .footer {
      .footer-logo {
        height: 4.5rem;
        margin-right: 10rem;
      }
      
      @media screen and ( max-width : 450px ) {
        .footer-logo {
          width: 20rem;
          height: auto;
        }
        
        .footer-content {
          > div {
            &:last-of-type {
              span {
                display: block;
              }
            }
          }
        }
      }
    }
  }
`;