import { StandardFonts } from "pdf-lib";
import { ISectionStyleProps } from "../interfaces/document";

export const DEFAULT_SECTION_STYLE: ISectionStyleProps = {
  characterStart: 0,
  characterEnd: 1,
  style: {
    characterSpacing: 0,
    fontSize: 12,
    fontType: StandardFonts.Helvetica,
  },
};
