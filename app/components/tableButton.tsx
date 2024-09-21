import { button } from "framer-motion/client";
import {
  TooltipTrigger,
  Button,
  Tooltip,
  ButtonProps,
} from "react-aria-components";

export function TableButton({
  buttonText,
  toolTipText,
  ...props
}: {
  buttonText: string;
  toolTipText: string;
} & ButtonProps) {
  return (
    <TooltipTrigger closeDelay={0} delay={200}>
      <Button
        className="min-w-8 flex-col bg-teal-400 text-gray-100 px-2 rounded-md disabled:bg-gray-400 disabled:text-gray-200"
        {...props}
      >
        {buttonText}
      </Button>
      <Tooltip>
        <div className="bg-black text-gray-200 p-2 border  border-gray-50 rounded-md">
          {toolTipText}
        </div>
      </Tooltip>
    </TooltipTrigger>
  );
}
