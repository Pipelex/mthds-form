/**
 * What ajv answered - the validator the run gate used before it validated
 * without generating code - on a table of targeted cases, captured once from
 * ajv@8.20.0 and ajv-formats@2.1.1 configured exactly as the gate configured
 * them (`allErrors`, `coerceTypes`, `strict: false`, `multipleOfPrecision: 8`,
 * the full formats, RJSF's `data-url` and `color`, the gate's `date` and
 * `date-time`). `schema-validator.test.ts` holds the interpreter to every
 * row. Captured data, not to be edited by hand: a row that disagrees with the
 * interpreter is a regression, or a deliberate change the CHANGELOG states.
 */

// prettier-ignore
export const AJV_VERDICTS: ReadonlyArray<{ name: string; schema: unknown; data: unknown; after: unknown; errors: ReadonlyArray<{ keyword: string; instancePath: string; schemaPath: string; params: Record<string, unknown>; message: string }> }> = [
  {
    "name": "number coerced from a numeric string",
    "schema": {
      "type": "object",
      "properties": {
        "n": {
          "type": "number"
        }
      }
    },
    "data": {
      "n": "20"
    },
    "after": {
      "n": 20
    },
    "errors": []
  },
  {
    "name": "number coerced from a padded string",
    "schema": {
      "type": "object",
      "properties": {
        "n": {
          "type": "number"
        }
      }
    },
    "data": {
      "n": " 2.5 "
    },
    "after": {
      "n": 2.5
    },
    "errors": []
  },
  {
    "name": "number refuses a word",
    "schema": {
      "type": "object",
      "properties": {
        "n": {
          "type": "number"
        }
      }
    },
    "data": {
      "n": "twenty"
    },
    "after": {
      "n": "twenty"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/n",
        "schemaPath": "#/properties/n/type",
        "params": {
          "type": "number"
        },
        "message": "must be number"
      }
    ]
  },
  {
    "name": "number coerced from a boolean and from null",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "number"
        },
        "b": {
          "type": "number"
        }
      }
    },
    "data": {
      "a": true,
      "b": null
    },
    "after": {
      "a": 1,
      "b": 0
    },
    "errors": []
  },
  {
    "name": "number refuses the empty string",
    "schema": {
      "type": "object",
      "properties": {
        "n": {
          "type": "number"
        }
      }
    },
    "data": {
      "n": ""
    },
    "after": {
      "n": ""
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/n",
        "schemaPath": "#/properties/n/type",
        "params": {
          "type": "number"
        },
        "message": "must be number"
      }
    ]
  },
  {
    "name": "integer coerced from \"5\", refused from \"5.5\"",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "integer"
        },
        "b": {
          "type": "integer"
        }
      }
    },
    "data": {
      "a": "5",
      "b": "5.5"
    },
    "after": {
      "a": 5,
      "b": "5.5"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/b",
        "schemaPath": "#/properties/b/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      }
    ]
  },
  {
    "name": "integer refuses a fractional number",
    "schema": {
      "type": "object",
      "properties": {
        "n": {
          "type": "integer"
        }
      }
    },
    "data": {
      "n": 2.5
    },
    "after": {
      "n": 2.5
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/n",
        "schemaPath": "#/properties/n/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      }
    ]
  },
  {
    "name": "string coerced from a number, a boolean and null",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        },
        "b": {
          "type": "string"
        },
        "c": {
          "type": "string"
        }
      }
    },
    "data": {
      "a": 42,
      "b": false,
      "c": null
    },
    "after": {
      "a": "42",
      "b": "false",
      "c": ""
    },
    "errors": []
  },
  {
    "name": "string refuses an object",
    "schema": {
      "type": "object",
      "properties": {
        "s": {
          "type": "string",
          "title": "Name"
        }
      }
    },
    "data": {
      "s": {
        "x": 1
      }
    },
    "after": {
      "s": {
        "x": 1
      }
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/s",
        "schemaPath": "#/properties/s/type",
        "params": {
          "type": "string"
        },
        "message": "must be string"
      }
    ]
  },
  {
    "name": "boolean coerced from words and digits",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "boolean"
        },
        "b": {
          "type": "boolean"
        },
        "c": {
          "type": "boolean"
        },
        "d": {
          "type": "boolean"
        }
      }
    },
    "data": {
      "a": "true",
      "b": "false",
      "c": 1,
      "d": 0
    },
    "after": {
      "a": true,
      "b": false,
      "c": true,
      "d": false
    },
    "errors": []
  },
  {
    "name": "boolean refuses \"yes\"",
    "schema": {
      "type": "object",
      "properties": {
        "b": {
          "type": "boolean"
        }
      }
    },
    "data": {
      "b": "yes"
    },
    "after": {
      "b": "yes"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/b",
        "schemaPath": "#/properties/b/type",
        "params": {
          "type": "boolean"
        },
        "message": "must be boolean"
      }
    ]
  },
  {
    "name": "null coerced from \"\", 0 and false",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "null"
        },
        "b": {
          "type": "null"
        },
        "c": {
          "type": "null"
        }
      }
    },
    "data": {
      "a": "",
      "b": 0,
      "c": false
    },
    "after": {
      "a": null,
      "b": null,
      "c": null
    },
    "errors": []
  },
  {
    "name": "nullable integer: \"\" becomes null, \"7\" becomes 7",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": [
            "integer",
            "null"
          ]
        },
        "b": {
          "type": [
            "integer",
            "null"
          ]
        }
      }
    },
    "data": {
      "a": "",
      "b": "7"
    },
    "after": {
      "a": null,
      "b": 7
    },
    "errors": []
  },
  {
    "name": "a type list is tried in its own order",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": [
            "string",
            "number"
          ]
        },
        "b": {
          "type": [
            "boolean",
            "number"
          ]
        },
        "c": {
          "type": [
            "null",
            "string"
          ]
        }
      }
    },
    "data": {
      "a": 3,
      "b": 1,
      "c": 0
    },
    "after": {
      "a": 3,
      "b": 1,
      "c": null
    },
    "errors": []
  },
  {
    "name": "an object is never coerced",
    "schema": {
      "type": "object",
      "properties": {
        "obj": {
          "type": "object",
          "title": "Thing",
          "properties": {
            "x": {
              "type": "string"
            }
          }
        }
      }
    },
    "data": {
      "obj": "x"
    },
    "after": {
      "obj": "x"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/obj",
        "schemaPath": "#/properties/obj/type",
        "params": {
          "type": "object"
        },
        "message": "must be object"
      }
    ]
  },
  {
    "name": "an array is never coerced",
    "schema": {
      "type": "object",
      "properties": {
        "arr": {
          "type": "array",
          "items": {
            "type": "integer"
          }
        }
      }
    },
    "data": {
      "arr": "1"
    },
    "after": {
      "arr": "1"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/arr",
        "schemaPath": "#/properties/arr/type",
        "params": {
          "type": "array"
        },
        "message": "must be array"
      }
    ]
  },
  {
    "name": "coercion reaches array items",
    "schema": {
      "type": "object",
      "properties": {
        "arr": {
          "type": "array",
          "items": {
            "type": "integer"
          }
        }
      }
    },
    "data": {
      "arr": [
        "1",
        "2",
        "x"
      ]
    },
    "after": {
      "arr": [
        1,
        2,
        "x"
      ]
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/arr/2",
        "schemaPath": "#/properties/arr/items/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      }
    ]
  },
  {
    "name": "anyOf keeps a coercion from an abandoned branch",
    "schema": {
      "type": "object",
      "properties": {
        "x": {
          "anyOf": [
            {
              "type": "integer",
              "minimum": 100
            },
            {
              "type": "string",
              "minLength": 3
            }
          ]
        }
      }
    },
    "data": {
      "x": "12"
    },
    "after": {
      "x": "12"
    },
    "errors": [
      {
        "keyword": "minimum",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/anyOf/0/minimum",
        "params": {
          "comparison": ">=",
          "limit": 100
        },
        "message": "must be >= 100"
      },
      {
        "keyword": "minLength",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/anyOf/1/minLength",
        "params": {
          "limit": 3
        },
        "message": "must NOT have fewer than 3 characters"
      },
      {
        "keyword": "anyOf",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/anyOf",
        "params": {},
        "message": "must match a schema in anyOf"
      }
    ]
  },
  {
    "name": "anyOf reports every branch then itself",
    "schema": {
      "type": "object",
      "properties": {
        "x": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "boolean"
            }
          ]
        }
      }
    },
    "data": {
      "x": "abc"
    },
    "after": {
      "x": "abc"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/anyOf/0/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      },
      {
        "keyword": "type",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/anyOf/1/type",
        "params": {
          "type": "boolean"
        },
        "message": "must be boolean"
      },
      {
        "keyword": "anyOf",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/anyOf",
        "params": {},
        "message": "must match a schema in anyOf"
      }
    ]
  },
  {
    "name": "anyOf with an always-valid branch is skipped",
    "schema": {
      "type": "object",
      "properties": {
        "x": {
          "anyOf": [
            {
              "type": "integer"
            },
            {}
          ]
        }
      }
    },
    "data": {
      "x": "5"
    },
    "after": {
      "x": "5"
    },
    "errors": []
  },
  {
    "name": "oneOf with two passing branches",
    "schema": {
      "type": "object",
      "properties": {
        "x": {
          "oneOf": [
            {
              "type": "number"
            },
            {
              "type": "integer"
            }
          ]
        }
      }
    },
    "data": {
      "x": 3
    },
    "after": {
      "x": 3
    },
    "errors": [
      {
        "keyword": "oneOf",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/oneOf",
        "params": {
          "passingSchemas": [
            0,
            1
          ]
        },
        "message": "must match exactly one schema in oneOf"
      }
    ]
  },
  {
    "name": "oneOf with none passing",
    "schema": {
      "type": "object",
      "properties": {
        "x": {
          "oneOf": [
            {
              "type": "number",
              "minimum": 10
            },
            {
              "type": "integer",
              "maximum": 0
            }
          ]
        }
      }
    },
    "data": {
      "x": 5
    },
    "after": {
      "x": 5
    },
    "errors": [
      {
        "keyword": "minimum",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/oneOf/0/minimum",
        "params": {
          "comparison": ">=",
          "limit": 10
        },
        "message": "must be >= 10"
      },
      {
        "keyword": "maximum",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/oneOf/1/maximum",
        "params": {
          "comparison": "<=",
          "limit": 0
        },
        "message": "must be <= 0"
      },
      {
        "keyword": "oneOf",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/oneOf",
        "params": {
          "passingSchemas": null
        },
        "message": "must match exactly one schema in oneOf"
      }
    ]
  },
  {
    "name": "allOf reports each failing branch",
    "schema": {
      "type": "object",
      "properties": {
        "x": {
          "allOf": [
            {
              "type": "number"
            },
            {
              "minimum": 3
            },
            {
              "maximum": 1
            }
          ]
        }
      }
    },
    "data": {
      "x": "2"
    },
    "after": {
      "x": 2
    },
    "errors": [
      {
        "keyword": "minimum",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/allOf/1/minimum",
        "params": {
          "comparison": ">=",
          "limit": 3
        },
        "message": "must be >= 3"
      },
      {
        "keyword": "maximum",
        "instancePath": "/x",
        "schemaPath": "#/properties/x/allOf/2/maximum",
        "params": {
          "comparison": "<=",
          "limit": 1
        },
        "message": "must be <= 1"
      }
    ]
  },
  {
    "name": "not",
    "schema": {
      "type": "object",
      "properties": {
        "s": {
          "not": {
            "type": "string"
          }
        }
      }
    },
    "data": {
      "s": "x"
    },
    "after": {
      "s": "x"
    },
    "errors": [
      {
        "keyword": "not",
        "instancePath": "/s",
        "schemaPath": "#/properties/s/not",
        "params": {},
        "message": "must NOT be valid"
      }
    ]
  },
  {
    "name": "if/then/else",
    "schema": {
      "type": "object",
      "if": {
        "properties": {
          "kind": {
            "const": "a"
          }
        }
      },
      "then": {
        "required": [
          "a"
        ]
      },
      "else": {
        "required": [
          "b"
        ]
      }
    },
    "data": {
      "kind": "a"
    },
    "after": {
      "kind": "a"
    },
    "errors": [
      {
        "keyword": "required",
        "instancePath": "",
        "schemaPath": "#/then/required",
        "params": {
          "missingProperty": "a"
        },
        "message": "must have required property 'a'"
      },
      {
        "keyword": "if",
        "instancePath": "",
        "schemaPath": "#/if",
        "params": {
          "failingKeyword": "then"
        },
        "message": "must match \"then\" schema"
      }
    ]
  },
  {
    "name": "if/else taken",
    "schema": {
      "type": "object",
      "if": {
        "properties": {
          "kind": {
            "const": "a"
          }
        }
      },
      "then": {
        "required": [
          "a"
        ]
      },
      "else": {
        "required": [
          "b"
        ]
      }
    },
    "data": {
      "kind": "z"
    },
    "after": {
      "kind": "z"
    },
    "errors": [
      {
        "keyword": "required",
        "instancePath": "",
        "schemaPath": "#/else/required",
        "params": {
          "missingProperty": "b"
        },
        "message": "must have required property 'b'"
      },
      {
        "keyword": "if",
        "instancePath": "",
        "schemaPath": "#/if",
        "params": {
          "failingKeyword": "else"
        },
        "message": "must match \"else\" schema"
      }
    ]
  },
  {
    "name": "required names each missing property, inherited names count as present",
    "schema": {
      "type": "object",
      "properties": {},
      "required": [
        "audience",
        "tone",
        "constructor"
      ]
    },
    "data": {},
    "after": {},
    "errors": [
      {
        "keyword": "required",
        "instancePath": "",
        "schemaPath": "#/required",
        "params": {
          "missingProperty": "audience"
        },
        "message": "must have required property 'audience'"
      },
      {
        "keyword": "required",
        "instancePath": "",
        "schemaPath": "#/required",
        "params": {
          "missingProperty": "tone"
        },
        "message": "must have required property 'tone'"
      }
    ]
  },
  {
    "name": "required on a nested object",
    "schema": {
      "type": "object",
      "properties": {
        "focus": {
          "type": "object",
          "title": "focus",
          "properties": {
            "audience": {
              "type": "string"
            }
          },
          "required": [
            "audience"
          ]
        }
      }
    },
    "data": {
      "focus": {}
    },
    "after": {
      "focus": {}
    },
    "errors": [
      {
        "keyword": "required",
        "instancePath": "/focus",
        "schemaPath": "#/properties/focus/required",
        "params": {
          "missingProperty": "audience"
        },
        "message": "must have required property 'audience'"
      }
    ]
  },
  {
    "name": "additionalProperties false",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        }
      },
      "additionalProperties": false
    },
    "data": {
      "a": "x",
      "b": 1,
      "c": 2
    },
    "after": {
      "a": "x",
      "b": 1,
      "c": 2
    },
    "errors": [
      {
        "keyword": "additionalProperties",
        "instancePath": "",
        "schemaPath": "#/additionalProperties",
        "params": {
          "additionalProperty": "b"
        },
        "message": "must NOT have additional properties"
      },
      {
        "keyword": "additionalProperties",
        "instancePath": "",
        "schemaPath": "#/additionalProperties",
        "params": {
          "additionalProperty": "c"
        },
        "message": "must NOT have additional properties"
      }
    ]
  },
  {
    "name": "additionalProperties schema",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        }
      },
      "additionalProperties": {
        "type": "integer"
      }
    },
    "data": {
      "a": "x",
      "b": "3",
      "c": "no"
    },
    "after": {
      "a": "x",
      "b": 3,
      "c": "no"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/c",
        "schemaPath": "#/additionalProperties/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      }
    ]
  },
  {
    "name": "patternProperties",
    "schema": {
      "type": "object",
      "properties": {},
      "patternProperties": {
        "^n_": {
          "type": "number"
        }
      }
    },
    "data": {
      "n_a": "1",
      "n_b": "x",
      "other": "y"
    },
    "after": {
      "n_a": 1,
      "n_b": "x",
      "other": "y"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/n_b",
        "schemaPath": "#/patternProperties/%5En_/type",
        "params": {
          "type": "number"
        },
        "message": "must be number"
      }
    ]
  },
  {
    "name": "propertyNames",
    "schema": {
      "type": "object",
      "properties": {},
      "propertyNames": {
        "maxLength": 3
      }
    },
    "data": {
      "abc": 1,
      "abcdef": 2
    },
    "after": {
      "abc": 1,
      "abcdef": 2
    },
    "errors": [
      {
        "keyword": "maxLength",
        "instancePath": "",
        "schemaPath": "#/propertyNames/maxLength",
        "params": {
          "limit": 3
        },
        "message": "must NOT have more than 3 characters"
      },
      {
        "keyword": "propertyNames",
        "instancePath": "",
        "schemaPath": "#/propertyNames",
        "params": {
          "propertyName": "abcdef"
        },
        "message": "property name must be valid"
      }
    ]
  },
  {
    "name": "min/maxProperties",
    "schema": {
      "type": "object",
      "properties": {},
      "minProperties": 2,
      "maxProperties": 3
    },
    "data": {
      "a": 1
    },
    "after": {
      "a": 1
    },
    "errors": [
      {
        "keyword": "minProperties",
        "instancePath": "",
        "schemaPath": "#/minProperties",
        "params": {
          "limit": 2
        },
        "message": "must NOT have fewer than 2 properties"
      }
    ]
  },
  {
    "name": "dependencies, both forms",
    "schema": {
      "type": "object",
      "properties": {},
      "dependencies": {
        "a": [
          "b",
          "c"
        ],
        "d": {
          "required": [
            "e"
          ]
        }
      }
    },
    "data": {
      "a": 1,
      "d": 2
    },
    "after": {
      "a": 1,
      "d": 2
    },
    "errors": [
      {
        "keyword": "dependencies",
        "instancePath": "",
        "schemaPath": "#/dependencies",
        "params": {
          "property": "a",
          "missingProperty": "b",
          "depsCount": 2,
          "deps": "b, c"
        },
        "message": "must have properties b, c when property a is present"
      },
      {
        "keyword": "dependencies",
        "instancePath": "",
        "schemaPath": "#/dependencies",
        "params": {
          "property": "a",
          "missingProperty": "c",
          "depsCount": 2,
          "deps": "b, c"
        },
        "message": "must have properties b, c when property a is present"
      },
      {
        "keyword": "required",
        "instancePath": "",
        "schemaPath": "#/dependencies/d/required",
        "params": {
          "missingProperty": "e"
        },
        "message": "must have required property 'e'"
      }
    ]
  },
  {
    "name": "string limits count code points",
    "schema": {
      "type": "object",
      "properties": {
        "s": {
          "type": "string",
          "minLength": 3,
          "maxLength": 4
        }
      }
    },
    "data": {
      "s": "😀😀"
    },
    "after": {
      "s": "😀😀"
    },
    "errors": [
      {
        "keyword": "minLength",
        "instancePath": "/s",
        "schemaPath": "#/properties/s/minLength",
        "params": {
          "limit": 3
        },
        "message": "must NOT have fewer than 3 characters"
      }
    ]
  },
  {
    "name": "pattern uses the u flag",
    "schema": {
      "type": "object",
      "properties": {
        "s": {
          "type": "string",
          "pattern": "^\\p{Lu}+$"
        }
      }
    },
    "data": {
      "s": "abc"
    },
    "after": {
      "s": "abc"
    },
    "errors": [
      {
        "keyword": "pattern",
        "instancePath": "/s",
        "schemaPath": "#/properties/s/pattern",
        "params": {
          "pattern": "^\\p{Lu}+$"
        },
        "message": "must match pattern \"^\\p{Lu}+$\""
      }
    ]
  },
  {
    "name": "number limits",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "number",
          "minimum": 1
        },
        "b": {
          "type": "number",
          "maximum": 1
        },
        "c": {
          "type": "number",
          "exclusiveMinimum": 1
        },
        "d": {
          "type": "number",
          "exclusiveMaximum": 1
        }
      }
    },
    "data": {
      "a": 0,
      "b": 2,
      "c": 1,
      "d": 1
    },
    "after": {
      "a": 0,
      "b": 2,
      "c": 1,
      "d": 1
    },
    "errors": [
      {
        "keyword": "minimum",
        "instancePath": "/a",
        "schemaPath": "#/properties/a/minimum",
        "params": {
          "comparison": ">=",
          "limit": 1
        },
        "message": "must be >= 1"
      },
      {
        "keyword": "maximum",
        "instancePath": "/b",
        "schemaPath": "#/properties/b/maximum",
        "params": {
          "comparison": "<=",
          "limit": 1
        },
        "message": "must be <= 1"
      },
      {
        "keyword": "exclusiveMinimum",
        "instancePath": "/c",
        "schemaPath": "#/properties/c/exclusiveMinimum",
        "params": {
          "comparison": ">",
          "limit": 1
        },
        "message": "must be > 1"
      },
      {
        "keyword": "exclusiveMaximum",
        "instancePath": "/d",
        "schemaPath": "#/properties/d/exclusiveMaximum",
        "params": {
          "comparison": "<",
          "limit": 1
        },
        "message": "must be < 1"
      }
    ]
  },
  {
    "name": "multipleOf with float precision",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "number",
          "multipleOf": 0.1
        },
        "b": {
          "type": "number",
          "multipleOf": 3
        }
      }
    },
    "data": {
      "a": 0.3,
      "b": 7
    },
    "after": {
      "a": 0.3,
      "b": 7
    },
    "errors": [
      {
        "keyword": "multipleOf",
        "instancePath": "/b",
        "schemaPath": "#/properties/b/multipleOf",
        "params": {
          "multipleOf": 3
        },
        "message": "must be multiple of 3"
      }
    ]
  },
  {
    "name": "const and enum",
    "schema": {
      "type": "object",
      "properties": {
        "c": {
          "const": 3
        },
        "d": {
          "const": {
            "a": 1
          }
        },
        "e": {
          "enum": [
            "a",
            1,
            null,
            {
              "b": 2
            }
          ]
        }
      }
    },
    "data": {
      "c": "3",
      "d": {
        "a": 2
      },
      "e": {
        "b": 2
      }
    },
    "after": {
      "c": "3",
      "d": {
        "a": 2
      },
      "e": {
        "b": 2
      }
    },
    "errors": [
      {
        "keyword": "const",
        "instancePath": "/c",
        "schemaPath": "#/properties/c/const",
        "params": {
          "allowedValue": 3
        },
        "message": "must be equal to constant"
      },
      {
        "keyword": "const",
        "instancePath": "/d",
        "schemaPath": "#/properties/d/const",
        "params": {
          "allowedValue": {
            "a": 1
          }
        },
        "message": "must be equal to constant"
      }
    ]
  },
  {
    "name": "enum of strings",
    "schema": {
      "type": "object",
      "properties": {
        "audience": {
          "type": "string",
          "enum": [
            "engineer",
            "executive"
          ],
          "title": "Audience"
        }
      }
    },
    "data": {
      "audience": "manager"
    },
    "after": {
      "audience": "manager"
    },
    "errors": [
      {
        "keyword": "enum",
        "instancePath": "/audience",
        "schemaPath": "#/properties/audience/enum",
        "params": {
          "allowedValues": [
            "engineer",
            "executive"
          ]
        },
        "message": "must be equal to one of the allowed values"
      }
    ]
  },
  {
    "name": "array limits",
    "schema": {
      "type": "object",
      "properties": {
        "shots": {
          "type": "array",
          "title": "shots",
          "minItems": 3,
          "maxItems": 4,
          "items": {}
        }
      }
    },
    "data": {
      "shots": [
        1,
        2
      ]
    },
    "after": {
      "shots": [
        1,
        2
      ]
    },
    "errors": [
      {
        "keyword": "minItems",
        "instancePath": "/shots",
        "schemaPath": "#/properties/shots/minItems",
        "params": {
          "limit": 3
        },
        "message": "must NOT have fewer than 3 items"
      }
    ]
  },
  {
    "name": "uniqueItems on scalars",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "array",
          "items": {
            "type": "integer"
          },
          "uniqueItems": true
        }
      }
    },
    "data": {
      "a": [
        1,
        2,
        1,
        3
      ]
    },
    "after": {
      "a": [
        1,
        2,
        1,
        3
      ]
    },
    "errors": [
      {
        "keyword": "uniqueItems",
        "instancePath": "/a",
        "schemaPath": "#/properties/a/uniqueItems",
        "params": {
          "i": 0,
          "j": 2
        },
        "message": "must NOT have duplicate items (items ## 2 and 0 are identical)"
      }
    ]
  },
  {
    "name": "uniqueItems on mixed scalar types",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "array",
          "items": {
            "type": [
              "integer",
              "string"
            ]
          },
          "uniqueItems": true
        }
      }
    },
    "data": {
      "a": [
        1,
        "1",
        2,
        "2",
        "1"
      ]
    },
    "after": {
      "a": [
        1,
        "1",
        2,
        "2",
        "1"
      ]
    },
    "errors": [
      {
        "keyword": "uniqueItems",
        "instancePath": "/a",
        "schemaPath": "#/properties/a/uniqueItems",
        "params": {
          "i": 1,
          "j": 4
        },
        "message": "must NOT have duplicate items (items ## 4 and 1 are identical)"
      }
    ]
  },
  {
    "name": "uniqueItems on objects",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "array",
          "uniqueItems": true
        }
      }
    },
    "data": {
      "a": [
        {
          "x": 1
        },
        {
          "x": 2
        },
        {
          "x": 1
        }
      ]
    },
    "after": {
      "a": [
        {
          "x": 1
        },
        {
          "x": 2
        },
        {
          "x": 1
        }
      ]
    },
    "errors": [
      {
        "keyword": "uniqueItems",
        "instancePath": "/a",
        "schemaPath": "#/properties/a/uniqueItems",
        "params": {
          "i": 2,
          "j": 0
        },
        "message": "must NOT have duplicate items (items ## 0 and 2 are identical)"
      }
    ]
  },
  {
    "name": "tuple items and additionalItems",
    "schema": {
      "type": "object",
      "properties": {
        "t": {
          "type": "array",
          "items": [
            {
              "type": "integer"
            },
            {
              "type": "string"
            }
          ],
          "additionalItems": false
        }
      }
    },
    "data": {
      "t": [
        "1",
        2,
        3
      ]
    },
    "after": {
      "t": [
        1,
        "2",
        3
      ]
    },
    "errors": [
      {
        "keyword": "additionalItems",
        "instancePath": "/t",
        "schemaPath": "#/properties/t/additionalItems",
        "params": {
          "limit": 2
        },
        "message": "must NOT have more than 2 items"
      }
    ]
  },
  {
    "name": "contains",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "array",
          "contains": {
            "type": "integer",
            "minimum": 5
          }
        }
      }
    },
    "data": {
      "a": [
        1,
        2
      ]
    },
    "after": {
      "a": [
        1,
        2
      ]
    },
    "errors": [
      {
        "keyword": "minimum",
        "instancePath": "/a/0",
        "schemaPath": "#/properties/a/contains/minimum",
        "params": {
          "comparison": ">=",
          "limit": 5
        },
        "message": "must be >= 5"
      },
      {
        "keyword": "minimum",
        "instancePath": "/a/1",
        "schemaPath": "#/properties/a/contains/minimum",
        "params": {
          "comparison": ">=",
          "limit": 5
        },
        "message": "must be >= 5"
      },
      {
        "keyword": "contains",
        "instancePath": "/a",
        "schemaPath": "#/properties/a/contains",
        "params": {
          "minContains": 1
        },
        "message": "must contain at least 1 valid item(s)"
      }
    ]
  },
  {
    "name": "format date, the gate's pydantic rule",
    "schema": {
      "type": "object",
      "properties": {
        "quote_date": {
          "type": "object",
          "title": "quote_date",
          "properties": {
            "date": {
              "type": "string",
              "format": "date",
              "title": "Date"
            }
          }
        }
      }
    },
    "data": {
      "quote_date": {
        "date": "2026-07-06T14:30:00+02:00"
      }
    },
    "after": {
      "quote_date": {
        "date": "2026-07-06T14:30:00+02:00"
      }
    },
    "errors": [
      {
        "keyword": "format",
        "instancePath": "/quote_date/date",
        "schemaPath": "#/properties/quote_date/properties/date/format",
        "params": {
          "format": "date"
        },
        "message": "must match format \"date\""
      }
    ]
  },
  {
    "name": "format date-time takes a bare day",
    "schema": {
      "type": "object",
      "properties": {
        "d": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "data": {
      "d": "2026-07-06"
    },
    "after": {
      "d": "2026-07-06"
    },
    "errors": []
  },
  {
    "name": "format date-time refuses an impossible day",
    "schema": {
      "type": "object",
      "properties": {
        "d": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "data": {
      "d": "2026-02-30T00:00:00Z"
    },
    "after": {
      "d": "2026-02-30T00:00:00Z"
    },
    "errors": [
      {
        "keyword": "format",
        "instancePath": "/d",
        "schemaPath": "#/properties/d/format",
        "params": {
          "format": "date-time"
        },
        "message": "must match format \"date-time\""
      }
    ]
  },
  {
    "name": "standard formats",
    "schema": {
      "type": "object",
      "properties": {
        "e": {
          "format": "email"
        },
        "u": {
          "format": "uri"
        },
        "id": {
          "format": "uuid"
        },
        "t": {
          "format": "time"
        },
        "h": {
          "format": "hostname"
        },
        "ip": {
          "format": "ipv4"
        },
        "du": {
          "format": "duration"
        }
      }
    },
    "data": {
      "e": "not-mail",
      "u": "relative/path",
      "id": "nope",
      "t": "12:00:00",
      "h": "-bad",
      "ip": "1.2.3",
      "du": "P"
    },
    "after": {
      "e": "not-mail",
      "u": "relative/path",
      "id": "nope",
      "t": "12:00:00",
      "h": "-bad",
      "ip": "1.2.3",
      "du": "P"
    },
    "errors": [
      {
        "keyword": "format",
        "instancePath": "/e",
        "schemaPath": "#/properties/e/format",
        "params": {
          "format": "email"
        },
        "message": "must match format \"email\""
      },
      {
        "keyword": "format",
        "instancePath": "/u",
        "schemaPath": "#/properties/u/format",
        "params": {
          "format": "uri"
        },
        "message": "must match format \"uri\""
      },
      {
        "keyword": "format",
        "instancePath": "/id",
        "schemaPath": "#/properties/id/format",
        "params": {
          "format": "uuid"
        },
        "message": "must match format \"uuid\""
      },
      {
        "keyword": "format",
        "instancePath": "/h",
        "schemaPath": "#/properties/h/format",
        "params": {
          "format": "hostname"
        },
        "message": "must match format \"hostname\""
      },
      {
        "keyword": "format",
        "instancePath": "/ip",
        "schemaPath": "#/properties/ip/format",
        "params": {
          "format": "ipv4"
        },
        "message": "must match format \"ipv4\""
      },
      {
        "keyword": "format",
        "instancePath": "/du",
        "schemaPath": "#/properties/du/format",
        "params": {
          "format": "duration"
        },
        "message": "must match format \"duration\""
      }
    ]
  },
  {
    "name": "data-url and color",
    "schema": {
      "type": "object",
      "properties": {
        "f": {
          "format": "data-url"
        },
        "c": {
          "format": "color"
        }
      }
    },
    "data": {
      "f": "data:text/plain;base64,QQ==",
      "c": "chartreuse"
    },
    "after": {
      "f": "data:text/plain;base64,QQ==",
      "c": "chartreuse"
    },
    "errors": [
      {
        "keyword": "format",
        "instancePath": "/c",
        "schemaPath": "#/properties/c/format",
        "params": {
          "format": "color"
        },
        "message": "must match format \"color\""
      }
    ]
  },
  {
    "name": "a number format",
    "schema": {
      "type": "object",
      "properties": {
        "n": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "data": {
      "n": 2147483648
    },
    "after": {
      "n": 2147483648
    },
    "errors": [
      {
        "keyword": "format",
        "instancePath": "/n",
        "schemaPath": "#/properties/n/format",
        "params": {
          "format": "int32"
        },
        "message": "must match format \"int32\""
      }
    ]
  },
  {
    "name": "an unknown format is ignored",
    "schema": {
      "type": "object",
      "properties": {
        "p": {
          "type": "string",
          "format": "path"
        }
      }
    },
    "data": {
      "p": "???"
    },
    "after": {
      "p": "???"
    },
    "errors": []
  },
  {
    "name": "a string format passes a number",
    "schema": {
      "type": "object",
      "properties": {
        "n": {
          "format": "email"
        }
      }
    },
    "data": {
      "n": 5
    },
    "after": {
      "n": 5
    },
    "errors": []
  },
  {
    "name": "$ref into $defs, inlined",
    "schema": {
      "$defs": {
        "Leaf": {
          "type": "number",
          "title": "Leaf"
        }
      },
      "type": "object",
      "properties": {
        "leaf": {
          "$ref": "#/$defs/Leaf"
        }
      }
    },
    "data": {
      "leaf": "x"
    },
    "after": {
      "leaf": "x"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/leaf",
        "schemaPath": "#/$defs/Leaf/type",
        "params": {
          "type": "number"
        },
        "message": "must be number"
      }
    ]
  },
  {
    "name": "$ref recursion",
    "schema": {
      "$defs": {
        "N": {
          "type": "object",
          "properties": {
            "v": {
              "type": "integer"
            },
            "next": {
              "anyOf": [
                {
                  "$ref": "#/$defs/N"
                },
                {
                  "type": "null"
                }
              ]
            }
          },
          "required": [
            "v"
          ]
        }
      },
      "$ref": "#/$defs/N"
    },
    "data": {
      "v": "1",
      "next": {
        "v": "x",
        "next": {
          "next": null
        }
      }
    },
    "after": {
      "v": 1,
      "next": {
        "v": "x",
        "next": {
          "next": null
        }
      }
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/next/v",
        "schemaPath": "#/properties/v/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      },
      {
        "keyword": "required",
        "instancePath": "/next/next",
        "schemaPath": "#/required",
        "params": {
          "missingProperty": "v"
        },
        "message": "must have required property 'v'"
      },
      {
        "keyword": "type",
        "instancePath": "/next/next",
        "schemaPath": "#/properties/next/anyOf/1/type",
        "params": {
          "type": "null"
        },
        "message": "must be null"
      },
      {
        "keyword": "anyOf",
        "instancePath": "/next/next",
        "schemaPath": "#/properties/next/anyOf",
        "params": {},
        "message": "must match a schema in anyOf"
      },
      {
        "keyword": "type",
        "instancePath": "/next",
        "schemaPath": "#/properties/next/anyOf/1/type",
        "params": {
          "type": "null"
        },
        "message": "must be null"
      },
      {
        "keyword": "anyOf",
        "instancePath": "/next",
        "schemaPath": "#/properties/next/anyOf",
        "params": {},
        "message": "must match a schema in anyOf"
      }
    ]
  },
  {
    "name": "$ref to the root",
    "schema": {
      "type": "object",
      "properties": {
        "self": {
          "$ref": "#"
        },
        "n": {
          "type": "integer"
        }
      }
    },
    "data": {
      "n": "1",
      "self": {
        "n": "x",
        "self": {
          "n": "2"
        }
      }
    },
    "after": {
      "n": 1,
      "self": {
        "n": "x",
        "self": {
          "n": 2
        }
      }
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/self/n",
        "schemaPath": "#/properties/n/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      }
    ]
  },
  {
    "name": "the root is not an object",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        }
      }
    },
    "data": null,
    "after": null,
    "errors": [
      {
        "keyword": "type",
        "instancePath": "",
        "schemaPath": "#/type",
        "params": {
          "type": "object"
        },
        "message": "must be object"
      }
    ]
  },
  {
    "name": "the root is a string",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        }
      }
    },
    "data": "garbage",
    "after": "garbage",
    "errors": [
      {
        "keyword": "type",
        "instancePath": "",
        "schemaPath": "#/type",
        "params": {
          "type": "object"
        },
        "message": "must be object"
      }
    ]
  },
  {
    "name": "a false subschema",
    "schema": {
      "type": "object",
      "properties": {
        "never": false
      }
    },
    "data": {
      "never": 1
    },
    "after": {
      "never": 1
    },
    "errors": [
      {
        "keyword": "false schema",
        "instancePath": "/never",
        "schemaPath": "#/properties/never/false schema",
        "params": {},
        "message": "boolean schema is false"
      }
    ]
  },
  {
    "name": "an object type error comes after the type-free keywords",
    "schema": {
      "type": "object",
      "properties": {
        "o": {
          "type": "object",
          "properties": {
            "x": {}
          },
          "enum": [
            {
              "x": 1
            }
          ]
        }
      }
    },
    "data": {
      "o": "no"
    },
    "after": {
      "o": "no"
    },
    "errors": [
      {
        "keyword": "enum",
        "instancePath": "/o",
        "schemaPath": "#/properties/o/enum",
        "params": {
          "allowedValues": [
            {
              "x": 1
            }
          ]
        },
        "message": "must be equal to one of the allowed values"
      },
      {
        "keyword": "type",
        "instancePath": "/o",
        "schemaPath": "#/properties/o/type",
        "params": {
          "type": "object"
        },
        "message": "must be object"
      }
    ]
  },
  {
    "name": "keys that need escaping in paths",
    "schema": {
      "type": "object",
      "properties": {
        "a/b": {
          "type": "integer"
        },
        "c~d": {
          "type": "integer"
        }
      }
    },
    "data": {
      "a/b": "x",
      "c~d": "y"
    },
    "after": {
      "a/b": "x",
      "c~d": "y"
    },
    "errors": [
      {
        "keyword": "type",
        "instancePath": "/a~1b",
        "schemaPath": "#/properties/a~1b/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      },
      {
        "keyword": "type",
        "instancePath": "/c~0d",
        "schemaPath": "#/properties/c~0d/type",
        "params": {
          "type": "integer"
        },
        "message": "must be integer"
      }
    ]
  }
];

// prettier-ignore
export const AJV_REFUSALS: ReadonlyArray<{ name: string; schema: unknown; message: string | null }> = [
  {
    "name": "an unresolvable $ref",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "$ref": "#/$defs/Missing"
        }
      }
    },
    "message": "can't resolve reference #/$defs/Missing from id #"
  },
  {
    "name": "an unknown type",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "type": "strin"
        }
      }
    },
    "message": "schema is invalid: data/properties/a/type must be equal to one of the allowed values, data/properties/a/type must be array, data/properties/a/type must match a schema in anyOf"
  },
  {
    "name": "a negative length",
    "schema": {
      "minLength": -1
    },
    "message": "schema is invalid: data/minLength must be >= 0"
  },
  {
    "name": "an empty enum",
    "schema": {
      "enum": []
    },
    "message": "schema is invalid: data/enum must NOT have fewer than 1 items"
  },
  {
    "name": "an invalid unicode pattern",
    "schema": {
      "pattern": "\\p"
    },
    "message": "Invalid regular expression: /\\p/u: Invalid property name"
  },
  {
    "name": "the unsupported id keyword",
    "schema": {
      "id": "x"
    },
    "message": "NOT SUPPORTED: keyword \"id\", use \"$id\" for schema ID"
  },
  {
    "name": "a string where a number belongs",
    "schema": {
      "type": "object",
      "properties": {
        "a": {
          "minLength": "3"
        }
      }
    },
    "message": "schema is invalid: data/properties/a/minLength must be integer"
  }
];
