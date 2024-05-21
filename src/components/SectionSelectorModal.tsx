import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { FC, useState } from "react";
import { ISectionStyleProps } from "../interfaces/document";
import TwButton from "./TwButton";
import { DEFAULT_SECTION_STYLE } from "../constant/sections";

import SectionEditorForm from "./SectionEditorForm";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  onSave: (sections: ISectionStyleProps[]) => void;
};

const SectionSelectorModal: FC<Props> = ({ handleClose, isOpen, onSave }) => {
  const [sections, setSections] = useState<ISectionStyleProps[]>([
    DEFAULT_SECTION_STYLE,
  ]);

  const handleSectionChange = (i: number, newSection: ISectionStyleProps) => {
    setSections((prev) =>
      prev.map((section, idx) => {
        return idx === i ? newSection : section;
      })
    );
  };

  return (
    <Dialog
      unmount={false}
      open={isOpen}
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
          <DialogTitle className="font-bold">Number of sections</DialogTitle>
          <Description>
            Select how many sections this block will have and how long they will
            be.
          </Description>

          {sections.map((section, i) => (
            <SectionEditorForm
              key={i}
              i={i}
              section={section}
              onSectionChange={handleSectionChange}
            />
          ))}

          <TwButton
            onClick={() =>
              setSections((prev) => [...prev, DEFAULT_SECTION_STYLE])
            }
          >
            Add section
          </TwButton>

          <div className="flex gap-4">
            <TwButton onClick={handleClose}>Cancel</TwButton>
            <TwButton
              onClick={() => {
                onSave(sections);
                handleClose();
              }}
            >
              Save
            </TwButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SectionSelectorModal;
