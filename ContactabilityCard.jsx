import React from "react";
import { hubspot } from "@hubspot/ui-extensions";
// Registro de la extensión. La jerarquía visual vive en ContactabilityCardView.jsx.
import { ContactabilityCardApp } from "./ContactabilityCardView";

hubspot.extend(({ context, actions }) => (
  <ContactabilityCardApp
    context={context}
    actions={actions}
    remoteFetch={(url, options) => hubspot.fetch(url, options)}
  />
));
