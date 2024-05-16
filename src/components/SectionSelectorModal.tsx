import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { FC, useState } from "react";
import { ISectionProps } from "../interfaces/document";
import TwButton from "./TwButton";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  onSave: (sections: ISectionProps[]) => void;
};

const SectionSelectorModal: FC<Props> = ({ handleClose, isOpen, onSave }) => {
  const [sections, setSections] = useState<ISectionProps[]>([
    { start: 0, end: 1 },
  ]);

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
              <h1 className="underline">Section {i + 1}</h1>
              <div className="flex items-center gap-2">
                <h2>Start char:</h2>
                <input
                  className="flex-1"
                  type="number"
                  min={0}
                  step={1}
                  value={section.start}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSections((prev) =>
                      prev.map((section, idx) => {
                        if (idx === i) {
                          return { ...section, start: Number(value) };
                        } else {
                          return section;
                        }
                      })
                    );
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <h2>End char:</h2>
                <input
                  className="flex-1"
                  type="number"
                  min={0}
                  step={1}
                  value={section.end}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSections((prev) =>
                      prev.map((section, idx) => {
                        if (idx === i) {
                          return { ...section, end: Number(value) };
                        } else {
                          return section;
                        }
                      })
                    );
                  }}
                />
              </div>
            </div>
          ))}

          <TwButton
            onClick={() =>
              setSections((prev) => [...prev, { start: 0, end: 1 }])
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
