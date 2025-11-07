import { useState } from "react";

export const usePopOver = () => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };
  return { isOpen, handleOpen, handleClose };
};
