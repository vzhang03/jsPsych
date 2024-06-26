import { JsPsych } from "jspsych";

import { AuthorsMap } from "./AuthorsMap";
import { VariablesMap } from "./VariablesMap";

/**
 * Class that handles the storage, update and retrieval of Metadata.
 *
 * @export
 * @class JsPsychMetadata
 * @typedef {JsPsychMetadata}
 */
export default class JsPsychMetadata {
  /**
   * Field that contains all metadata fields that aren't represented as a list.
   *
   * @private
   * @type {{}}
   */
  private metadata: {};
  /**
   * Custom class that stores and handles the storage, update and retrieval of author metadata.
   *
   * @private
   * @type {AuthorsMap}
   */
  private authors: AuthorsMap;
  /**
   * Custom class that stores and handles the storage, update and retrieval of variable metadata.
   *
   * @private
   * @type {VariablesMap}
   */
  private variables: VariablesMap;

  private cache: {};

  /**
   * Creates an instance of JsPsychMetadata while passing in JsPsych object to have access to context
   *  allowing it to access the screen printing information.
   *
   * @constructor
   * @param {JsPsych} JsPsych
   */
  constructor(private JsPsych: JsPsych) {
    this.generateDefaultMetadata();
  }
  /**
   * Method that fills in JsPsychMetadata class with all the universal fields with default information.
   * This is automatically called whenever creating an instance of JsPsychMetadata and indicates all
   * the required fields that need to filled in to be Psych-DS compliant.
   */
  generateDefaultMetadata(): void {
    this.metadata = {};
    this.setMetadataField("name", "title");
    this.setMetadataField("schemaVersion", "Psych-DS 0.4.0");
    this.setMetadataField("@context", "https://schema.org");
    this.setMetadataField("@type", "Dataset");
    this.setMetadataField("description", "Dataset generated using JsPsych");
    this.authors = new AuthorsMap();
    this.variables = new VariablesMap();
    this.cache = {};
  }

  /**
   * Method that sets simple metadata fields. This method can also be used to update/overwrite existing fields.
   *
   * @param {string} key - Metadata field name
   * @param {*} value - Data associated with the field
   */
  setMetadataField(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Simple get that accesses the data associated with a field.
   *
   * @param {string} key - Field name
   * @returns {*} - Data associated with the field
   */
  getMetadataField(key: string): any {
    return this.metadata[key];
  }

  /**
   * Returns the final Metadata in a single javascript object. Bundles together the author and variables
   * together in a list rather than object compliant with Psych-DS standards.
   *
   * @returns {{}} - Final Metadata object
   */
  getMetadata(): {} {
    const res = this.metadata;
    res["author"] = this.authors.getList();
    res["variableMeasured"] = this.variables.getList();

    return res;
  }

  /**
   * Method that creates an author. This method can also be used to overwrite existing authors
   * with the same name in order to update fields.
   *
   * @param {{
   *     type?: string;
   *     name: string;
   *     givenName?: string;
   *     familyName?: string;
   *     identifier?: string;
   *   }} fields - All the required or possible fields associated with listing an author according to Psych-DS standards.
   */
  setAuthor(fields: {
    type?: string;
    name: string;
    givenName?: string; // required
    familyName?: string;
    identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
  }): void {
    this.authors.setAuthor(fields);
  }

  /**
   * Method that fetches an author object allowing user to update (in existing workflow should not be necessary).
   *
   * @param {string} name - Name of author to be used as key.
   * @returns {{}} - Object with author information.
   */
  getAuthor(name: string): {} {
    return this.authors.getAuthor(name);
  }

  /**
   * Method that creates a variable. This method can also be used to overwrite variables with the same name
   * as a way to update fields.
   *
   * @param {{
   *     type?: string;
   *     name: string; // required
   *     description?: string | {};
   *     value?: string; // string, boolean, or number
   *     identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
   *     minValue?: number;
   *     maxValue?: number;
   *     levels?: string[] | []; // technically property values in the other one but not sure how to format it
   *     levelsOrdered?: boolean;
   *     na?: boolean;
   *     naValue?: string;
   *     alternateName?: string;
   *     privacy?: string;
   *   }} fields - Fields associated with the current Psych-DS standard.
   */
  setVariable(fields: {
    type?: string;
    name: string; // required
    description?: string | {};
    value?: string; // string, boolean, or number
    identifier?: string; // identifier that distinguish across dataset (URL)
    minValue?: number;
    maxValue?: number;
    levels?: string[] | []; // technically property values in the other one but not sure how to format it
    levelsOrdered?: boolean;
    na?: boolean;
    naValue?: string;
    alternateName?: string;
    privacy?: string;
  }): void {
    this.variables.setVariable(fields);
  }

  /**
   * Allows you to access a variable's information by using the name of the variable. Can
   * be used to update fields within a variable, but suggest using updateVariable() to prevent errors.
   *
   * @param {string} name - Name of variable to be accessed
   * @returns {{}} - Returns object of fields
   */
  getVariable(name: string): {} {
    return this.variables.getVariable(name);
  }

  containsVariable(name: string): boolean {
    return this.variables.containsVariable(name);
  }

  /**
   * Allows you to update a variable or add a value in the case of updating values. In other situations will
   * replace the existing value with the new value.
   *
   * @param {string} var_name - Name of variable to be updated.
   * @param {string} field_name - Name of field to be updated.
   * @param {(string | boolean | number | {})} added_value - Value to be used in the update.
   */
  updateVariable(
    var_name: string,
    field_name: string,
    added_value: string | boolean | number | {}
  ): void {
    this.variables.updateVariable(var_name, field_name, added_value);
  }

  /**
   * Allows you to delete a variable by key/name.
   *
   * @param {string} var_name - Name of variable to be deleted.
   */
  deleteVariable(var_name: string): void {
    this.variables.deleteVariable(var_name);
  }

  /**
   * Gets a list of all the variable names.
   *
   * @returns {string[]} - List of variable string names.
   */
  getVariableNames(): string[] {
    return this.variables.getVariableNames();
  }

  /**
   * Method that allows you to display metadata at the end of an experiment.
   *
   * @param {string} [elementId="jspsych-metadata-display"] - Id for how to style the metadata. Defaults to default styling.
   */
  displayMetadata(display_element) {
    const elementId = "jspsych-metadata-display";
    const metadata_string = JSON.stringify(this.getMetadata(), null, 2);
    // const display_element = this.JsPsych.getDisplayElement();
    display_element.innerHTML += `<p id="jspsych-metadata-header">Metadata</p><pre id="${elementId}" class="jspsych-preformat"></pre>`;
    document.getElementById(elementId).textContent += metadata_string;
  }

  /**
   * Method that begins a download for the dataset_description.json at the end of experiment.
   * Allows you to download the metadat.
   */
  saveAsJsonFile(): void {
    const jsonString = JSON.stringify(this.getMetadata(), null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset_description.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  // passing in authors mapping and variables mapping and then goes through each variable
  generate(data, metadata = {}) {
    // have it so that can pass in a dict of object that the researcher wants to do
    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    for (const observation of data) {
      this.generateObservation(observation);
    }

    for (const key in metadata) {
      this.processMetadata(metadata, key);
    }

    return this.getMetadata();
  }

  private generateObservation(observation) {
    // variables can be thought of mapping of one column in a row
    const pluginType = observation["trial_type"];
    const ignored_fields = new Set(["trial_type", "trial_index", "time_elapsed"]);

    for (const variable in observation) {
      const value = observation[variable];

      if (ignored_fields.has(variable)) this.updateFields(variable, value, typeof value);
      else if (this.containsVariable(variable)) {
        // logic updates existing variable
        this.generateUpdate(variable, value, pluginType);
      } else {
        // logic to create new variable
        this.generateVariable(variable, value, pluginType);
      }
    }
  }

  private generateVariable(variable, value, pluginType) {
    // probably should work in a call to the plugin here
    const description = this.getPluginInfo(pluginType);
    const type = typeof value;

    // probs should have update description called here
    const new_var = {
      type: "PropertyValue",
      name: variable,
      description: { default: "unknown" }, // need to adjust this based on what is handling
      value: type,
    };

    this.setVariable(new_var);
    this.updateFields(variable, value, type);
  }

  // hardest part is updating the description
  // want to hardcode in the variables check
  // logic is that probably won't need to be doing the dict thing
  // implement all as description
  private generateUpdate(variable, value, pluginType) {
    const type = typeof value;
    const field_name = "description";
    const description = this.getPluginInfo(pluginType);
    // const new_value = { pluginType: description };
    const new_description = { [pluginType]: "unknown" };

    this.updateVariable(variable, field_name, new_description);
    this.updateFields(variable, value, type);
  }

  private updateFields(variable, value, type) {
    // calls updates where updateVariable handles logic
    if (type !== "number" && type !== "object") {
      this.updateVariable(variable, "levels", value);
    }
    // calls updates where updateVariable handles logic
    if (type === "number") {
      this.updateVariable(variable, "minValue", value);
      this.updateVariable(variable, "maxValue", value);
    }
  }

  private processMetadata(metadata, key) {
    const value = metadata[key];

    if (key === "variables") {
      if (typeof value !== "object" || value === null) {
        console.error("Variable object is either null or incorrect type");
        return;
      }

      // all of the variables must already exist because should have datapoints
      for (let variable_key in value) {
        if (!this.containsVariable(variable_key)) {
          console.error("Metadata does not contain variable:", variable_key);
          continue;
        }

        const variable_parameters = value[variable_key];

        if (typeof variable_parameters !== "object" || variable_parameters === null) {
          console.error(
            "Parameters of variable:",
            variable_key,
            "is either null or incorrect type. The value",
            variable_parameters,
            "is either null or not an object."
          );
          continue;
        }

        for (const parameter in variable_parameters) {
          // calling updates for each of the renamed parameters within variable/errors handled by method call
          const parameter_value = variable_parameters[parameter];
          this.updateVariable(variable_key, parameter, parameter_value);
          if (parameter === "name") variable_key = parameter_value; // renames future instances if changing name
        }
      }
    } else if (key === "author") {
      if (typeof value !== "object" || value === null) {
        console.error("Author object is not correct type");
        return;
      }

      for (const author_key in value) {
        const author = value[author_key];
        if (!("name" in author)) author["name"] = author_key;
        this.setAuthor(author);
      }
    } else this.setMetadataField(key, value);
  }

  private getPluginInfo(pluginType) {
    // fill in with logic on how to call plugin api and unpkg
  }
}
