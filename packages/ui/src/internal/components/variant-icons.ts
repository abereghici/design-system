import { CheckCircleIcon } from "../../components/icon/icons/check-circle.tsx";
import { DangerIcon } from "../../components/icon/icons/danger.tsx";
import { InfoIcon } from "../../components/icon/icons/info.tsx";
import { WarningIcon } from "../../components/icon/icons/warning.tsx";

/** The icon each status Variant shows, the same in an Alert and a Toast. */
export const variantIcons = {
  neutral: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};
