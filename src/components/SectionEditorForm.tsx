import { FC } from "react";
import { ISectionStyleProps } from "../interfaces/document";
import { Select } from "@headlessui/react";
import { StandardFonts } from "pdf-lib";
import { calcFontHeight } from "../utils/calcFontHeight";

type Props = {
  i: number;
  section: ISectionStyleProps;
  onSectionChange: (i: number, section: ISectionStyleProps) => void;
};

const SectionEditorForm: FC<Props> = ({ i, onSectionChange, section }) => {
  return (
    <div key={i}>
      <h1 className="underline">Section {i + 1}</h1>
      <div className="flex items-center gap-2">
        <h2>Start char:</h2>
        <input
          className="flex-1"
          type="number"
          min={0}
          step={1}
          value={section.characterStart}
          onChange={(e) => {
            const value = e.target.value;

            onSectionChange(i, { ...section, characterStart: Number(value) });
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
          value={section.characterEnd}
          onChange={(e) => {
            const value = e.target.value;
            onSectionChange(i, { ...section, characterEnd: Number(value) });
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <h2>Font size:</h2>
        <input
          className="flex-1"
          type="number"
          min={0}
          step={1}
          value={section.style.fontSize}
          onChange={async (e) => {
            const value = e.target.value;

            const fontHeight = await calcFontHeight({
              fontSize: Number(value),
              fontType: section.style.fontType,
            });

            onSectionChange(i, {
              ...section,
              style: {
                ...section.style,
                fontSize: Number(value),
                fontHeight,
              },
            });
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <h2>Letter spacing:</h2>
        <input
          className="flex-1"
          type="number"
          min={0}
          step={1}
          value={section.style.characterSpacing}
          onChange={(e) => {
            const value = e.target.value;
            onSectionChange(i, {
              ...section,
              style: {
                ...section.style,
                characterSpacing: Number(value),
              },
            });
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <h2>Font family:</h2>
        <Select
          className="flex-1"
          value={section.style.fontType}
          onChange={async (e) => {
            const value = String(e.target.value) as StandardFonts;

            const fontHeight = await calcFontHeight({
              fontSize: section.style.fontSize,
              fontType: value,
            });

            onSectionChange(i, {
              ...section,
              style: { ...section.style, fontType: value, fontHeight },
            });
          }}
        >
          <option value={StandardFonts.Courier}>{StandardFonts.Courier}</option>
          <option value={StandardFonts.Helvetica}>
            {StandardFonts.Helvetica}
          </option>
          <option value={StandardFonts.TimesRoman}>
            {StandardFonts.TimesRoman}
          </option>
        </Select>
      </div>
    </div>
  );
};

export default SectionEditorForm;
