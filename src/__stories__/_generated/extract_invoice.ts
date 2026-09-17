/**
 * Generated from data/methods/extract_invoice/bundle.mthds - DO NOT EDIT.
 *
 * Invoice extraction, an authored method. Copied verbatim from https://github.com/Pipelex/pipelex-cookbook/blob/4265d86a5551b788ccf1c7be5b00393e12c82aef/examples/b_basics/document_extract/extract_invoice/bundle.mthds (MIT).
 *
 * Regenerate with `make fixtures`. The pipes below are the author's own,
 * projected from the bundle exactly as committed: nothing is synthesized.
 * See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'invoice_extraction.analyze_invoice',
  'invoice_extraction.extract_invoice',
  'invoice_extraction.extract_invoice_data',
  'invoice_extraction.process_invoice',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'invoice_extraction.analyze_invoice': {
    inputs: {
      invoice_page: {
        concept_ref: 'native.Page',
        item_count: null,
        json_schema: {
          $defs: {
            ImageContent: {
              description: 'An image',
              properties: {
                caption: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The caption of the image',
                  title: 'Caption',
                },
                filename: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The original filename of the image',
                  title: 'Filename',
                },
                height: {
                  anyOf: [
                    {
                      exclusiveMinimum: 0,
                      type: 'integer',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The height of the image, in pixels',
                  title: 'Height',
                },
                mime_type: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The MIME type of the image',
                  title: 'Mime Type',
                },
                public_url: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The public URL of the image',
                  title: 'Public Url',
                },
                source_negative_prompt: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The source negative prompt of the image',
                  title: 'Source Negative Prompt',
                },
                source_prompt: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The source prompt of the image',
                  title: 'Source Prompt',
                },
                url: {
                  description: 'The image URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
                  title: 'Url',
                  type: 'string',
                },
                width: {
                  anyOf: [
                    {
                      exclusiveMinimum: 0,
                      type: 'integer',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The width of the image, in pixels',
                  title: 'Width',
                },
              },
              required: ['url'],
              title: 'ImageContent',
              type: 'object',
            },
            TextAndImagesContent: {
              properties: {
                images: {
                  anyOf: [
                    {
                      items: {
                        $ref: '#/$defs/ImageContent',
                      },
                      type: 'array',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'A list of images that were extracted from the text',
                  title: 'Images',
                },
                raw_html: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The raw HTML of the fetched page, if requested',
                  title: 'Raw Html',
                },
                text: {
                  anyOf: [
                    {
                      $ref: '#/$defs/TextContent',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'A text content',
                },
              },
              title: 'TextAndImagesContent',
              type: 'object',
            },
            TextContent: {
              description: 'A text',
              properties: {
                text: {
                  description: 'The text',
                  title: 'Text',
                  type: 'string',
                },
              },
              required: ['text'],
              title: 'TextContent',
              type: 'object',
            },
          },
          description:
            'The content of a page of a document, comprising text and linked images and an optional page view image',
          properties: {
            page_view: {
              anyOf: [
                {
                  $ref: '#/$defs/ImageContent',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The screenshot of the page',
            },
            text_and_images: {
              $ref: '#/$defs/TextAndImagesContent',
              description: 'The text and images content extracted from the page',
            },
          },
          required: ['text_and_images'],
          title: 'native.Page',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'invoice_extraction.InvoiceDetails',
      item_count: null,
      json_schema: {
        description: 'Classification of the invoice type (formal bill vs simple receipt)',
        properties: {
          category: {
            anyOf: [
              {
                enum: ['bill', 'receipt'],
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The category of the invoice',
            title: 'Category',
          },
          explanation: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Explanation of the classification',
            title: 'Explanation',
          },
        },
        title: 'invoice_extraction.InvoiceDetails',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'invoice_extraction.extract_invoice': {
    inputs: {
      invoice_page: {
        concept_ref: 'native.Page',
        item_count: null,
        json_schema: {
          $defs: {
            ImageContent: {
              description: 'An image',
              properties: {
                caption: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The caption of the image',
                  title: 'Caption',
                },
                filename: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The original filename of the image',
                  title: 'Filename',
                },
                height: {
                  anyOf: [
                    {
                      exclusiveMinimum: 0,
                      type: 'integer',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The height of the image, in pixels',
                  title: 'Height',
                },
                mime_type: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The MIME type of the image',
                  title: 'Mime Type',
                },
                public_url: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The public URL of the image',
                  title: 'Public Url',
                },
                source_negative_prompt: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The source negative prompt of the image',
                  title: 'Source Negative Prompt',
                },
                source_prompt: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The source prompt of the image',
                  title: 'Source Prompt',
                },
                url: {
                  description: 'The image URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
                  title: 'Url',
                  type: 'string',
                },
                width: {
                  anyOf: [
                    {
                      exclusiveMinimum: 0,
                      type: 'integer',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The width of the image, in pixels',
                  title: 'Width',
                },
              },
              required: ['url'],
              title: 'ImageContent',
              type: 'object',
            },
            TextAndImagesContent: {
              properties: {
                images: {
                  anyOf: [
                    {
                      items: {
                        $ref: '#/$defs/ImageContent',
                      },
                      type: 'array',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'A list of images that were extracted from the text',
                  title: 'Images',
                },
                raw_html: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The raw HTML of the fetched page, if requested',
                  title: 'Raw Html',
                },
                text: {
                  anyOf: [
                    {
                      $ref: '#/$defs/TextContent',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'A text content',
                },
              },
              title: 'TextAndImagesContent',
              type: 'object',
            },
            TextContent: {
              description: 'A text',
              properties: {
                text: {
                  description: 'The text',
                  title: 'Text',
                  type: 'string',
                },
              },
              required: ['text'],
              title: 'TextContent',
              type: 'object',
            },
          },
          description:
            'The content of a page of a document, comprising text and linked images and an optional page view image',
          properties: {
            page_view: {
              anyOf: [
                {
                  $ref: '#/$defs/ImageContent',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The screenshot of the page',
            },
            text_and_images: {
              $ref: '#/$defs/TextAndImagesContent',
              description: 'The text and images content extracted from the page',
            },
          },
          required: ['text_and_images'],
          title: 'native.Page',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'invoice_extraction.Invoice',
      item_count: null,
      json_schema: {
        $defs: {
          invoice_extraction__InvoiceDetails: {
            description: 'Classification of the invoice type (formal bill vs simple receipt)',
            properties: {
              category: {
                anyOf: [
                  {
                    enum: ['bill', 'receipt'],
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'The category of the invoice',
                title: 'Category',
              },
              explanation: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Explanation of the classification',
                title: 'Explanation',
              },
            },
            title: 'invoice_extraction__InvoiceDetails',
            type: 'object',
          },
        },
        description:
          'Invoice information extracted from text, supporting both formal bills and receipts',
        properties: {
          amount_excl_tax: {
            anyOf: [
              {
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Net amount excluding taxes',
            title: 'Amount Excl Tax',
          },
          amount_incl_tax: {
            anyOf: [
              {
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Total amount including taxes',
            title: 'Amount Incl Tax',
          },
          category: {
            anyOf: [
              {
                $ref: '#/$defs/invoice_extraction__InvoiceDetails',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Category or type of expense',
          },
          company_address: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Address of the purchasing company',
            title: 'Company Address',
          },
          company_name: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Name of the purchasing company',
            title: 'Company Name',
          },
          description: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Description of goods or services purchased',
            title: 'Description',
          },
          invoice_id: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Unique identifier for the invoice',
            title: 'Invoice Id',
          },
          invoice_number: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Invoice number as shown on the document',
            title: 'Invoice Number',
          },
          issue_date: {
            anyOf: [
              {
                format: 'date',
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Date when the invoice was issued',
            title: 'Issue Date',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Raw text extracted from the invoice',
            title: 'Text',
          },
          time: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Time of the transaction if available',
            title: 'Time',
          },
          vat_amount: {
            anyOf: [
              {
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Total VAT/tax amount',
            title: 'Vat Amount',
          },
          vat_rates: {
            anyOf: [
              {
                items: {
                  type: 'number',
                },
                type: 'array',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'List of VAT rates applied',
            title: 'Vat Rates',
          },
          vendor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Name of the vendor/seller',
            title: 'Vendor',
          },
          vendor_address: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Complete address of the vendor',
            title: 'Vendor Address',
          },
          vendor_siret: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'SIRET number of the vendor (French company registration)',
            title: 'Vendor Siret',
          },
          vendor_vat_number: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'VAT registration number of the vendor',
            title: 'Vendor Vat Number',
          },
        },
        title: 'invoice_extraction.Invoice',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'invoice_extraction.extract_invoice_data': {
    inputs: {
      invoice_details: {
        concept_ref: 'invoice_extraction.InvoiceDetails',
        item_count: null,
        json_schema: {
          description: 'Classification of the invoice type (formal bill vs simple receipt)',
          properties: {
            category: {
              anyOf: [
                {
                  enum: ['bill', 'receipt'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The category of the invoice',
              title: 'Category',
            },
            explanation: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Explanation of the classification',
              title: 'Explanation',
            },
          },
          title: 'invoice_extraction.InvoiceDetails',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      invoice_page: {
        concept_ref: 'native.Page',
        item_count: null,
        json_schema: {
          $defs: {
            ImageContent: {
              description: 'An image',
              properties: {
                caption: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The caption of the image',
                  title: 'Caption',
                },
                filename: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The original filename of the image',
                  title: 'Filename',
                },
                height: {
                  anyOf: [
                    {
                      exclusiveMinimum: 0,
                      type: 'integer',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The height of the image, in pixels',
                  title: 'Height',
                },
                mime_type: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The MIME type of the image',
                  title: 'Mime Type',
                },
                public_url: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The public URL of the image',
                  title: 'Public Url',
                },
                source_negative_prompt: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The source negative prompt of the image',
                  title: 'Source Negative Prompt',
                },
                source_prompt: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The source prompt of the image',
                  title: 'Source Prompt',
                },
                url: {
                  description: 'The image URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
                  title: 'Url',
                  type: 'string',
                },
                width: {
                  anyOf: [
                    {
                      exclusiveMinimum: 0,
                      type: 'integer',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The width of the image, in pixels',
                  title: 'Width',
                },
              },
              required: ['url'],
              title: 'ImageContent',
              type: 'object',
            },
            TextAndImagesContent: {
              properties: {
                images: {
                  anyOf: [
                    {
                      items: {
                        $ref: '#/$defs/ImageContent',
                      },
                      type: 'array',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'A list of images that were extracted from the text',
                  title: 'Images',
                },
                raw_html: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'The raw HTML of the fetched page, if requested',
                  title: 'Raw Html',
                },
                text: {
                  anyOf: [
                    {
                      $ref: '#/$defs/TextContent',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'A text content',
                },
              },
              title: 'TextAndImagesContent',
              type: 'object',
            },
            TextContent: {
              description: 'A text',
              properties: {
                text: {
                  description: 'The text',
                  title: 'Text',
                  type: 'string',
                },
              },
              required: ['text'],
              title: 'TextContent',
              type: 'object',
            },
          },
          description:
            'The content of a page of a document, comprising text and linked images and an optional page view image',
          properties: {
            page_view: {
              anyOf: [
                {
                  $ref: '#/$defs/ImageContent',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The screenshot of the page',
            },
            text_and_images: {
              $ref: '#/$defs/TextAndImagesContent',
              description: 'The text and images content extracted from the page',
            },
          },
          required: ['text_and_images'],
          title: 'native.Page',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'invoice_extraction.Invoice',
      item_count: null,
      json_schema: {
        $defs: {
          invoice_extraction__InvoiceDetails: {
            description: 'Classification of the invoice type (formal bill vs simple receipt)',
            properties: {
              category: {
                anyOf: [
                  {
                    enum: ['bill', 'receipt'],
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'The category of the invoice',
                title: 'Category',
              },
              explanation: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Explanation of the classification',
                title: 'Explanation',
              },
            },
            title: 'invoice_extraction__InvoiceDetails',
            type: 'object',
          },
        },
        description:
          'Invoice information extracted from text, supporting both formal bills and receipts',
        properties: {
          amount_excl_tax: {
            anyOf: [
              {
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Net amount excluding taxes',
            title: 'Amount Excl Tax',
          },
          amount_incl_tax: {
            anyOf: [
              {
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Total amount including taxes',
            title: 'Amount Incl Tax',
          },
          category: {
            anyOf: [
              {
                $ref: '#/$defs/invoice_extraction__InvoiceDetails',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Category or type of expense',
          },
          company_address: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Address of the purchasing company',
            title: 'Company Address',
          },
          company_name: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Name of the purchasing company',
            title: 'Company Name',
          },
          description: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Description of goods or services purchased',
            title: 'Description',
          },
          invoice_id: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Unique identifier for the invoice',
            title: 'Invoice Id',
          },
          invoice_number: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Invoice number as shown on the document',
            title: 'Invoice Number',
          },
          issue_date: {
            anyOf: [
              {
                format: 'date',
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Date when the invoice was issued',
            title: 'Issue Date',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Raw text extracted from the invoice',
            title: 'Text',
          },
          time: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Time of the transaction if available',
            title: 'Time',
          },
          vat_amount: {
            anyOf: [
              {
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Total VAT/tax amount',
            title: 'Vat Amount',
          },
          vat_rates: {
            anyOf: [
              {
                items: {
                  type: 'number',
                },
                type: 'array',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'List of VAT rates applied',
            title: 'Vat Rates',
          },
          vendor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Name of the vendor/seller',
            title: 'Vendor',
          },
          vendor_address: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Complete address of the vendor',
            title: 'Vendor Address',
          },
          vendor_siret: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'SIRET number of the vendor (French company registration)',
            title: 'Vendor Siret',
          },
          vendor_vat_number: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'VAT registration number of the vendor',
            title: 'Vendor Vat Number',
          },
        },
        title: 'invoice_extraction.Invoice',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'invoice_extraction.process_invoice': {
    inputs: {
      document: {
        concept_ref: 'native.Document',
        item_count: null,
        json_schema: {
          description: 'A document',
          properties: {
            filename: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The original filename of the document',
              title: 'Filename',
            },
            mime_type: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The MIME type of the document',
              title: 'Mime Type',
            },
            public_url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The public HTTPS URL of the document',
              title: 'Public Url',
            },
            snippet: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'A text snippet or excerpt from the document',
              title: 'Snippet',
            },
            title: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The title of the document or source',
              title: 'Title',
            },
            url: {
              description: 'The document URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
              type: 'string',
            },
          },
          required: ['url'],
          title: 'native.Document',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'invoice_extraction.Invoice',
      item_count: null,
      json_schema: {
        $defs: {
          invoice_extraction__Invoice: {
            description:
              'Invoice information extracted from text, supporting both formal bills and receipts',
            properties: {
              amount_excl_tax: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Net amount excluding taxes',
                title: 'Amount Excl Tax',
              },
              amount_incl_tax: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Total amount including taxes',
                title: 'Amount Incl Tax',
              },
              category: {
                anyOf: [
                  {
                    $ref: '#/$defs/invoice_extraction__InvoiceDetails',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Category or type of expense',
              },
              company_address: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Address of the purchasing company',
                title: 'Company Address',
              },
              company_name: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Name of the purchasing company',
                title: 'Company Name',
              },
              description: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Description of goods or services purchased',
                title: 'Description',
              },
              invoice_id: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Unique identifier for the invoice',
                title: 'Invoice Id',
              },
              invoice_number: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Invoice number as shown on the document',
                title: 'Invoice Number',
              },
              issue_date: {
                anyOf: [
                  {
                    format: 'date',
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Date when the invoice was issued',
                title: 'Issue Date',
              },
              text: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Raw text extracted from the invoice',
                title: 'Text',
              },
              time: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Time of the transaction if available',
                title: 'Time',
              },
              vat_amount: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Total VAT/tax amount',
                title: 'Vat Amount',
              },
              vat_rates: {
                anyOf: [
                  {
                    items: {
                      type: 'number',
                    },
                    type: 'array',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'List of VAT rates applied',
                title: 'Vat Rates',
              },
              vendor: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Name of the vendor/seller',
                title: 'Vendor',
              },
              vendor_address: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Complete address of the vendor',
                title: 'Vendor Address',
              },
              vendor_siret: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'SIRET number of the vendor (French company registration)',
                title: 'Vendor Siret',
              },
              vendor_vat_number: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'VAT registration number of the vendor',
                title: 'Vendor Vat Number',
              },
            },
            title: 'invoice_extraction__Invoice',
            type: 'object',
          },
          invoice_extraction__InvoiceDetails: {
            description: 'Classification of the invoice type (formal bill vs simple receipt)',
            properties: {
              category: {
                anyOf: [
                  {
                    enum: ['bill', 'receipt'],
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'The category of the invoice',
                title: 'Category',
              },
              explanation: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Explanation of the classification',
                title: 'Explanation',
              },
            },
            title: 'invoice_extraction__InvoiceDetails',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/invoice_extraction__Invoice',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[invoice_extraction__Invoice]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'invoice_extraction.analyze_invoice': {
    fields: [
      {
        concept_ref: 'native.Page',
        description:
          'The content of a page of a document, comprising text and linked images and an optional page view image',
        fields: [
          {
            concept_ref: 'native.TextAndImages',
            description: 'The text and images content extracted from the page',
            fields: [
              {
                concept_ref: 'native.Text',
                description: 'A text content',
                kind: 'prose',
                name: 'text',
                required: false,
              },
              {
                concept_ref: 'native.Image',
                description: 'A list of images that were extracted from the text',
                item: {
                  concept_ref: 'native.Image',
                  description: 'An image',
                  kind: 'image',
                  required: true,
                },
                kind: 'list',
                name: 'images',
                required: false,
              },
              {
                description: 'The raw HTML of the fetched page, if requested',
                kind: 'text',
                name: 'raw_html',
                required: false,
              },
            ],
            kind: 'object',
            name: 'text_and_images',
            required: true,
          },
          {
            concept_ref: 'native.Image',
            description: 'The screenshot of the page',
            kind: 'image',
            name: 'page_view',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'invoice_page',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'invoice_extraction.extract_invoice': {
    fields: [
      {
        concept_ref: 'native.Page',
        description:
          'The content of a page of a document, comprising text and linked images and an optional page view image',
        fields: [
          {
            concept_ref: 'native.TextAndImages',
            description: 'The text and images content extracted from the page',
            fields: [
              {
                concept_ref: 'native.Text',
                description: 'A text content',
                kind: 'prose',
                name: 'text',
                required: false,
              },
              {
                concept_ref: 'native.Image',
                description: 'A list of images that were extracted from the text',
                item: {
                  concept_ref: 'native.Image',
                  description: 'An image',
                  kind: 'image',
                  required: true,
                },
                kind: 'list',
                name: 'images',
                required: false,
              },
              {
                description: 'The raw HTML of the fetched page, if requested',
                kind: 'text',
                name: 'raw_html',
                required: false,
              },
            ],
            kind: 'object',
            name: 'text_and_images',
            required: true,
          },
          {
            concept_ref: 'native.Image',
            description: 'The screenshot of the page',
            kind: 'image',
            name: 'page_view',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'invoice_page',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'invoice_extraction.extract_invoice_data': {
    fields: [
      {
        concept_ref: 'native.Page',
        description:
          'The content of a page of a document, comprising text and linked images and an optional page view image',
        fields: [
          {
            concept_ref: 'native.TextAndImages',
            description: 'The text and images content extracted from the page',
            fields: [
              {
                concept_ref: 'native.Text',
                description: 'A text content',
                kind: 'prose',
                name: 'text',
                required: false,
              },
              {
                concept_ref: 'native.Image',
                description: 'A list of images that were extracted from the text',
                item: {
                  concept_ref: 'native.Image',
                  description: 'An image',
                  kind: 'image',
                  required: true,
                },
                kind: 'list',
                name: 'images',
                required: false,
              },
              {
                description: 'The raw HTML of the fetched page, if requested',
                kind: 'text',
                name: 'raw_html',
                required: false,
              },
            ],
            kind: 'object',
            name: 'text_and_images',
            required: true,
          },
          {
            concept_ref: 'native.Image',
            description: 'The screenshot of the page',
            kind: 'image',
            name: 'page_view',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'invoice_page',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'invoice_extraction.InvoiceDetails',
        description: 'Classification of the invoice type (formal bill vs simple receipt)',
        fields: [
          {
            choices: ['bill', 'receipt'],
            description: 'The category of the invoice',
            kind: 'enum',
            name: 'category',
            required: false,
          },
          {
            description: 'Explanation of the classification',
            kind: 'text',
            name: 'explanation',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'invoice_details',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'invoice_extraction.process_invoice': {
    fields: [
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: true,
        kind: 'document',
        name: 'document',
        presence: 'plain',
        required: true,
      },
    ],
  },
};

/**
 * The output half - a standard artifact, keyed by the same pipe_ref set as the
 * two above because all three builders iterate one pipe sequence. The payload
 * SCHEMA is not here: it rides `CONTRACTS[ref].output.json_schema`, where the
 * standard puts it, beside the input schemas.
 */
export const OUTPUT_FORM: OutputForm = {
  'invoice_extraction.analyze_invoice': {
    field: {
      concept_ref: 'invoice_extraction.InvoiceDetails',
      description: 'Classification of the invoice type (formal bill vs simple receipt)',
      fields: [
        {
          choices: ['bill', 'receipt'],
          description: 'The category of the invoice',
          kind: 'enum',
          name: 'category',
          required: false,
        },
        {
          description: 'Explanation of the classification',
          kind: 'text',
          name: 'explanation',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'invoice_extraction.extract_invoice': {
    field: {
      concept_ref: 'invoice_extraction.Invoice',
      description:
        'Invoice information extracted from text, supporting both formal bills and receipts',
      fields: [
        {
          description: 'Unique identifier for the invoice',
          kind: 'text',
          name: 'invoice_id',
          required: false,
        },
        {
          description: 'Invoice number as shown on the document',
          kind: 'text',
          name: 'invoice_number',
          required: false,
        },
        {
          datetime: false,
          description: 'Date when the invoice was issued',
          kind: 'date',
          name: 'issue_date',
          required: false,
        },
        {
          description: 'Time of the transaction if available',
          kind: 'text',
          name: 'time',
          required: false,
        },
        {
          description: 'Total amount including taxes',
          integer: false,
          kind: 'number',
          name: 'amount_incl_tax',
          required: false,
        },
        {
          description: 'Net amount excluding taxes',
          integer: false,
          kind: 'number',
          name: 'amount_excl_tax',
          required: false,
        },
        {
          description: 'Total VAT/tax amount',
          integer: false,
          kind: 'number',
          name: 'vat_amount',
          required: false,
        },
        {
          description: 'List of VAT rates applied',
          item: {
            integer: false,
            kind: 'number',
            required: true,
          },
          kind: 'list',
          name: 'vat_rates',
          required: false,
        },
        {
          description: 'Name of the vendor/seller',
          kind: 'text',
          name: 'vendor',
          required: false,
        },
        {
          description: 'Complete address of the vendor',
          kind: 'text',
          name: 'vendor_address',
          required: false,
        },
        {
          description: 'SIRET number of the vendor (French company registration)',
          kind: 'text',
          name: 'vendor_siret',
          required: false,
        },
        {
          description: 'VAT registration number of the vendor',
          kind: 'text',
          name: 'vendor_vat_number',
          required: false,
        },
        {
          description: 'Name of the purchasing company',
          kind: 'text',
          name: 'company_name',
          required: false,
        },
        {
          description: 'Address of the purchasing company',
          kind: 'text',
          name: 'company_address',
          required: false,
        },
        {
          description: 'Description of goods or services purchased',
          kind: 'text',
          name: 'description',
          required: false,
        },
        {
          concept_ref: 'invoice_extraction.InvoiceDetails',
          description: 'Category or type of expense',
          fields: [
            {
              choices: ['bill', 'receipt'],
              description: 'The category of the invoice',
              kind: 'enum',
              name: 'category',
              required: false,
            },
            {
              description: 'Explanation of the classification',
              kind: 'text',
              name: 'explanation',
              required: false,
            },
          ],
          kind: 'object',
          name: 'category',
          required: false,
        },
        {
          description: 'Raw text extracted from the invoice',
          kind: 'text',
          name: 'text',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'invoice_extraction.extract_invoice_data': {
    field: {
      concept_ref: 'invoice_extraction.Invoice',
      description:
        'Invoice information extracted from text, supporting both formal bills and receipts',
      fields: [
        {
          description: 'Unique identifier for the invoice',
          kind: 'text',
          name: 'invoice_id',
          required: false,
        },
        {
          description: 'Invoice number as shown on the document',
          kind: 'text',
          name: 'invoice_number',
          required: false,
        },
        {
          datetime: false,
          description: 'Date when the invoice was issued',
          kind: 'date',
          name: 'issue_date',
          required: false,
        },
        {
          description: 'Time of the transaction if available',
          kind: 'text',
          name: 'time',
          required: false,
        },
        {
          description: 'Total amount including taxes',
          integer: false,
          kind: 'number',
          name: 'amount_incl_tax',
          required: false,
        },
        {
          description: 'Net amount excluding taxes',
          integer: false,
          kind: 'number',
          name: 'amount_excl_tax',
          required: false,
        },
        {
          description: 'Total VAT/tax amount',
          integer: false,
          kind: 'number',
          name: 'vat_amount',
          required: false,
        },
        {
          description: 'List of VAT rates applied',
          item: {
            integer: false,
            kind: 'number',
            required: true,
          },
          kind: 'list',
          name: 'vat_rates',
          required: false,
        },
        {
          description: 'Name of the vendor/seller',
          kind: 'text',
          name: 'vendor',
          required: false,
        },
        {
          description: 'Complete address of the vendor',
          kind: 'text',
          name: 'vendor_address',
          required: false,
        },
        {
          description: 'SIRET number of the vendor (French company registration)',
          kind: 'text',
          name: 'vendor_siret',
          required: false,
        },
        {
          description: 'VAT registration number of the vendor',
          kind: 'text',
          name: 'vendor_vat_number',
          required: false,
        },
        {
          description: 'Name of the purchasing company',
          kind: 'text',
          name: 'company_name',
          required: false,
        },
        {
          description: 'Address of the purchasing company',
          kind: 'text',
          name: 'company_address',
          required: false,
        },
        {
          description: 'Description of goods or services purchased',
          kind: 'text',
          name: 'description',
          required: false,
        },
        {
          concept_ref: 'invoice_extraction.InvoiceDetails',
          description: 'Category or type of expense',
          fields: [
            {
              choices: ['bill', 'receipt'],
              description: 'The category of the invoice',
              kind: 'enum',
              name: 'category',
              required: false,
            },
            {
              description: 'Explanation of the classification',
              kind: 'text',
              name: 'explanation',
              required: false,
            },
          ],
          kind: 'object',
          name: 'category',
          required: false,
        },
        {
          description: 'Raw text extracted from the invoice',
          kind: 'text',
          name: 'text',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'invoice_extraction.process_invoice': {
    field: {
      concept_ref: 'invoice_extraction.Invoice',
      description:
        'Invoice information extracted from text, supporting both formal bills and receipts',
      item: {
        concept_ref: 'invoice_extraction.Invoice',
        description:
          'Invoice information extracted from text, supporting both formal bills and receipts',
        fields: [
          {
            description: 'Unique identifier for the invoice',
            kind: 'text',
            name: 'invoice_id',
            required: false,
          },
          {
            description: 'Invoice number as shown on the document',
            kind: 'text',
            name: 'invoice_number',
            required: false,
          },
          {
            datetime: false,
            description: 'Date when the invoice was issued',
            kind: 'date',
            name: 'issue_date',
            required: false,
          },
          {
            description: 'Time of the transaction if available',
            kind: 'text',
            name: 'time',
            required: false,
          },
          {
            description: 'Total amount including taxes',
            integer: false,
            kind: 'number',
            name: 'amount_incl_tax',
            required: false,
          },
          {
            description: 'Net amount excluding taxes',
            integer: false,
            kind: 'number',
            name: 'amount_excl_tax',
            required: false,
          },
          {
            description: 'Total VAT/tax amount',
            integer: false,
            kind: 'number',
            name: 'vat_amount',
            required: false,
          },
          {
            description: 'List of VAT rates applied',
            item: {
              integer: false,
              kind: 'number',
              required: true,
            },
            kind: 'list',
            name: 'vat_rates',
            required: false,
          },
          {
            description: 'Name of the vendor/seller',
            kind: 'text',
            name: 'vendor',
            required: false,
          },
          {
            description: 'Complete address of the vendor',
            kind: 'text',
            name: 'vendor_address',
            required: false,
          },
          {
            description: 'SIRET number of the vendor (French company registration)',
            kind: 'text',
            name: 'vendor_siret',
            required: false,
          },
          {
            description: 'VAT registration number of the vendor',
            kind: 'text',
            name: 'vendor_vat_number',
            required: false,
          },
          {
            description: 'Name of the purchasing company',
            kind: 'text',
            name: 'company_name',
            required: false,
          },
          {
            description: 'Address of the purchasing company',
            kind: 'text',
            name: 'company_address',
            required: false,
          },
          {
            description: 'Description of goods or services purchased',
            kind: 'text',
            name: 'description',
            required: false,
          },
          {
            concept_ref: 'invoice_extraction.InvoiceDetails',
            description: 'Category or type of expense',
            fields: [
              {
                choices: ['bill', 'receipt'],
                description: 'The category of the invoice',
                kind: 'enum',
                name: 'category',
                required: false,
              },
              {
                description: 'Explanation of the classification',
                kind: 'text',
                name: 'explanation',
                required: false,
              },
            ],
            kind: 'object',
            name: 'category',
            required: false,
          },
          {
            description: 'Raw text extracted from the invoice',
            kind: 'text',
            name: 'text',
            required: false,
          },
        ],
        kind: 'object',
        required: true,
      },
      kind: 'list',
      name: 'output',
      required: true,
    },
  },
};

/**
 * What the author wrote about each pipe - its `description` - and about the
 * bundle. No validate artifact carries either, and an authored method's brief
 * opens with the pipe's: it is what a host would have. On a structures case
 * every entry is the synthesized carrier's line, and the hero states its own.
 */
export const PIPE_DESCRIPTIONS: Record<string, string> = {
  'invoice_extraction.analyze_invoice': 'Analyze the invoice',
  'invoice_extraction.extract_invoice':
    'Extract invoice information from an invoice text transcript',
  'invoice_extraction.extract_invoice_data':
    'Extract invoice information from an invoice text transcript',
  'invoice_extraction.process_invoice': 'Process relevant information from an invoice',
};

export const DOMAIN_DESCRIPTION: string | null = null;
