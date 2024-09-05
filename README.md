# brevity-format
This repository contains documentation for the .brev (Brevity note) file format as well as the parser used in the Brevity client and Brevity server.<br>
If you're a regular Brevity user, you probably don't have to read this as Brevity will manage your files automatically. This repo can help you tinker with Brevity files though if you want.

## .brev structure explanation
This is an example file formatted in .brev:
```
My English class note 
h1 {weight: 600, font-size: 1.5, color: "#ff0000"} "My English class note"
text {font-size: 0.8, color: "#ffffff"} "This is the beginning of my English class note."
```
As you can tell by looking into the structure of the format, the first line is just a title of the note that displays in the editor. Then each line after it is a next element. Element defining lines consist of 3 sections, the element identifier, element properties (which depend on the identifier) and element content. Element identifier is usually similar to the HTML tag name of it, but as you can see regular text (not headers) are defined by a ``text`` identifier.

This file contains a note with "My English class note" title and two elements. First one being a red header with 1.5rem font size and 600 font weight, in this case containing the note title. Then below the header there is a white paragraph of 0.8rem font size saying "This is the beginning of my English class note." and we didn't define the weight as we don't have to because font weight has a default value for the "text" element, in this case it's 300.
