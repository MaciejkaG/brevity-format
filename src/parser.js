// Brevity note format (.brev) parser.
// Ver. 1.0.0
// © 2024 mcjk

import fs from 'node:fs';
import colorString from 'color-string';

// This object contains elements' possible metadata attributes by their element identifier.
// It will help with validating the metadata passed and actualy element types.
const elementsAtrributes = {
    'h1': [
        { name: 'weight', type: 'number', default: 700 },
        { name: 'font-size', type: 'number', default: 2 },
        { name: 'color', type: 'string', default: '#ffffff' },
    ],
    'h2': [
        { name: 'weight', type: 'number', default: 600 },
        { name: 'font-size', type: 'number', default: 1.75 },
        { name: 'color', type: 'string', default: '#ffffff' },
    ],
    'h3': [
        { name: 'weight', type: 'number', default: 600 },
        { name: 'font-size', type: 'number', default: 1.5 },
        { name: 'color', type: 'string', default: '#ffffff' },
    ],
    'text': [
        { name: 'weight', type: 'number', default: 400 },
        { name: 'font-size', type: 'number', default: 1 },
        { name: 'color', type: 'string', default: '#ffffff' },
    ],
    'img': [
        { name: 'width', type: 'number', default: 5 },
    ],
};

// We keep the names of color attributes here.
const colorAttributesNames = ['color', 'background-color'];

// This function coverts a .brev file to HTML editor format.
export function brevToHTML(filePath) {
    // Read the .brev file content
    const fileContent = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean); // filter to remove empty lines

    // The first line is the note title
    const noteTitle = fileContent[0].trim();

    let fullHTML = '';

    // Process each subsequent line as an element
    for (let i = 1; i < fileContent.length; i++) {
        const line = fileContent[i].trim();

        // Regular expression to capture the element, JSON metadata, and the quoted content, excluding escaped quotes (\" inside content)
        const regex = /^(\w+)(?:\s+({.*?}))?\s+"((?:[^"\\]|\\.)*)"$/;
        const match = line.match(regex);

        if (match) {
            const elementIdentifier = match[1]; // e.g., h1, p, etc.
            let elementMetadata = match[2] ? JSON.parse(match[2]) : {}; // Metadata as JSON object, empty if missing
            const content = match[3].replace(/\\"/g, '"');; // Content inside quotes

            if (!validateElement(elementIdentifier, elementMetadata)) {
                throw Error('Error, element invalid.');
            }

            fullHTML += '<div>';

            // Get full element metadata by a function that combains defined and default values.
            elementMetadata = getFullMetadata(elementIdentifier, elementMetadata);

            switch (elementIdentifier) {
                case 'h1':
                    fullHTML += `<h1 style="font-size:${elementMetadata['font-size']}rem;font-weight:${elementMetadata.weight};color:${elementMetadata.color}">${content}</h1>`;
                    break;

                case 'h2':
                    fullHTML += `<h2 style="font-size:${elementMetadata['font-size']}rem;font-weight:${elementMetadata.weight};color:${elementMetadata.color}">${content}</h2>`;
                    break;

                case 'h3':
                    fullHTML += `<h3 style="font-size:${elementMetadata['font-size']}rem;font-weight:${elementMetadata.weight};color:${elementMetadata.color}">${content}</h3>`;
                    break;

                case 'text':
                    fullHTML += `<span style="font-size:${elementMetadata['font-size']}rem;font-weight:${elementMetadata.weight};color:${elementMetadata.color}">${content}</span>`;
                    break;

                case 'img':
                    fullHTML += `<img style="width:${elementMetadata['width']}rem;" src="${content}">`;
                    break;

                default:
                    break;
            }

            fullHTML += '</div>';
        } else {
            console.error(`Syntax error at line ${i + 1}: "${line}"`);
        }
    }

    return { title: noteTitle, html: fullHTML };
}

function validateElement(identifier, metadata) {
    // Try getting the element's possible metadata attributes from the elementsAttributes object.
    const possibleAttributes = elementsAtrributes[identifier];

    // If the attributes are undefined, the element identifier is incorrect.
    if (possibleAttributes === undefined) return false;

    // Check whether the passed metadata contains unallowed attributes.
    try {
        Object.entries(metadata).forEach(([key, value]) => {
            // If current attribute doesn't exist in the possible attributes array.
            if (!possibleAttributes.some((attr) => key === attr.name && typeof value === attr.type)) {
                throw Error(); // Throw an error when an incorrect metadata attribute is detected.
            }

            // If current attribute is a color attribute as defined in the colorAttributesNames array, but the attribute cannot be parsed as a color.
            // We need this validation to prevent XSSes like: 'color: "\"onload="doBadThings()"'
            if (colorAttributesNames.includes(key) && !isColor(value)) {
                throw Error();
            }
        });
    } catch (err) {
        console.error(err);
        return false; // Incorrect metadata attribute.
    }

    // Check whether the passed metadata misses some required attributes.
    for (let i = 0; i < possibleAttributes.length; i++) {
        const attr = possibleAttributes[i];

        // If the attribute does not have a default value and it isn't included in the metadata (missing required attribute)
        if (attr['default'] === undefined && metadata[attr.name] === undefined) {
            return false;
        }
    }

    // All checks passed.
    return true;
}

// This function returns the full metadata for an element based on the metadata already passed.
// It basically combines the 'metadata' variable with default values of the not included attributes.
function getFullMetadata(identifier, metadata) {
    // Try getting the element's possible metadata attributes from the elementsAttributes object.
    const possibleAttributes = elementsAtrributes[identifier];

    // If the attributes are undefined, the element identifier is incorrect.
    if (possibleAttributes === undefined) throw Error('Incorrect metadata identifier');

    // Iterate all possible attributes of the element.
    for (let i = 0; i < possibleAttributes.length; i++) {
        const attr = possibleAttributes[i];

        if (metadata[attr.name] === undefined && attr['default'] !== undefined) { // If the current attribute wasn't passed in the metadata and it has a default value.
            metadata[attr.name] = attr.default; // Pass the value from the passed metadata to the full metadata.
        }
    }

    return metadata;
}

// Example usage:
// module.exports.parseBrevFile(''); // Replace with the path to your .brev file
// let res = getFullMetadata('h1', { 'font-size': 1.5 });
// console.log(res);

function isColor(color) {
    return !!colorString.get(color); // returns true if valid, false if not
}