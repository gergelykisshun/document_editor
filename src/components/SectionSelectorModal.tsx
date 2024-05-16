import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { FC, useState } from "react";
import { ISectionLength } from "../interfaces/document";
import TwButton from "./TwButton";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  onSave: (sections: ISectionLength[]) => void;
};

const SectionSelectorModal: FC<Props> = ({ handleClose, isOpen, onSave }) => {
  const [sections, setSections] = useState<ISectionLength[]>([{ length: 5 }]);

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
            <div key={i}>
              <input
                type="number"
                min={0}
                step={1}
                value={section.length}
                onChange={(e) => {
                  const value = e.target.value;

                  setSections((prev) =>
                    prev.map((section, idx) => {
                      if (idx === i) {
                        return { length: Number(value) };
                      } else {
                        return section;
                      }
                    })
                  );
                }}
              />
            </div>
          ))}

          <TwButton
            onClick={() => setSections((prev) => [...prev, { length: 1 }])}
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
