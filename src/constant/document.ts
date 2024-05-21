import { IDocumentType } from "../interfaces/document";

export const MOCK_DOCUMENT_MULTI_PAGE: IDocumentType = {
  id: 1,
  name: "Multi page mock document",
  fieldTypes: [
    { id: 1, name: "name", placeholder: "Ted Bear", type: "text" },
    {
      id: 2,
      name: "description",
      placeholder:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus ad officia expedita molestiae voluptatem quos, esse asperiores modi consectetur ipsum architecto maxime tempore mollitia iusto tenetur quae, dolorem quod culpa.",
      type: "text",
    },
    { id: 3, name: "tax_number", placeholder: "123456789", type: "number" },
    { id: 4, name: "date", placeholder: "20220401", type: "date" },
  ],
  fields: [],
};

export const MOCK_DOCUMENT_SINGLE_PAGE: IDocumentType = {
  id: 1,
  name: "Első házasok test document",
  fieldTypes: [
    { id: 1, name: "name", placeholder: "Ted Bear", type: "text" },
    {
      id: 2,
      name: "description",
      placeholder:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus ad officia expedita molestiae voluptatem quos, esse asperiores modi consectetur ipsum architecto maxime tempore mollitia iusto tenetur quae, dolorem quod culpa.",
      type: "text",
    },
    { id: 3, name: "tax_number", placeholder: "123456789", type: "number" },
    { id: 4, name: "date", placeholder: "20220401", type: "date" },
  ],
  fields: [],
};
