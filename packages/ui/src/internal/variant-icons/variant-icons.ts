import { CheckCircleIcon } from "../../icon/icons/check-circle.tsx";
import { DangerIcon } from "../../icon/icons/danger.tsx";
import { InfoIcon } from "../../icon/icons/info.tsx";
import { WarningIcon } from "../../icon/icons/warning.tsx";

/** The icon each status Variant shows, the same in an Alert and a Toast. */
export const variantIcons = {
  neutral: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};
