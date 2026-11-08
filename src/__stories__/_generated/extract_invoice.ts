/**
 * Generated from data/methods/extract_invoice/bundle.mthds - DO NOT EDIT.
 *
 * Invoice extraction, an authored method. Copied verbatim from https://github.com/Pipelex/methods/blob/08367d9a0ca7206d866094ae97c7b4257716cc28/methods/invoice_extraction/invoice_extraction.mthds (MIT).
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
  'invoice_extraction.extract_invoice_pages',
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
          invoice_extraction__InvoiceLineItem: {
            description:
              'One priced line of an invoice or a receipt, as printed: a product, a service, a fee or a discount',
            properties: {
              amount: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  "Total of the line, in the invoice's currency, as printed; negative for a discount or a refund",
                title: 'Amount',
              },
              label: {
                description:
                  'What the line is for, as printed: the product, service, fee or discount',
                title: 'Label',
                type: 'string',
              },
              quantity: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  'How many units, or how much, as printed; may be fractional for a weighed or measured item. Empty when the line prints no quantity',
                title: 'Quantity',
              },
              unit_price: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  "Price of one unit, in the invoice's currency, when the line prints it",
                title: 'Unit Price',
              },
            },
            required: ['label'],
            title: 'invoice_extraction__InvoiceLineItem',
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
            description: "Net amount excluding taxes, in the invoice's currency",
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
            description: "Total amount including taxes, in the invoice's currency",
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
          currency: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              "ISO 4217 code of the currency the invoice's totals and lines are expressed in, three uppercase letters such as EUR, USD or GBP; never the currency of a converted amount or of a card payment in another currency. Empty when the document does not determine it",
            title: 'Currency',
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
            description:
              'One-line summary of what was purchased; the purchase line by line is in line_items',
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
          line_items: {
            anyOf: [
              {
                items: {
                  $ref: '#/$defs/invoice_extraction__InvoiceLineItem',
                },
                type: 'array',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The priced lines of the invoice, in the order printed, fees and discounts included; never the subtotal, tax, total or payment lines',
            title: 'Line Items',
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
            description: "Total VAT or tax amount, in the invoice's currency",
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
            description: 'VAT rates applied, as percentages: 20 for 20 %',
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
          invoice_extraction__InvoiceLineItem: {
            description:
              'One priced line of an invoice or a receipt, as printed: a product, a service, a fee or a discount',
            properties: {
              amount: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  "Total of the line, in the invoice's currency, as printed; negative for a discount or a refund",
                title: 'Amount',
              },
              label: {
                description:
                  'What the line is for, as printed: the product, service, fee or discount',
                title: 'Label',
                type: 'string',
              },
              quantity: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  'How many units, or how much, as printed; may be fractional for a weighed or measured item. Empty when the line prints no quantity',
                title: 'Quantity',
              },
              unit_price: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  "Price of one unit, in the invoice's currency, when the line prints it",
                title: 'Unit Price',
              },
            },
            required: ['label'],
            title: 'invoice_extraction__InvoiceLineItem',
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
            description: "Net amount excluding taxes, in the invoice's currency",
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
            description: "Total amount including taxes, in the invoice's currency",
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
          currency: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              "ISO 4217 code of the currency the invoice's totals and lines are expressed in, three uppercase letters such as EUR, USD or GBP; never the currency of a converted amount or of a card payment in another currency. Empty when the document does not determine it",
            title: 'Currency',
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
            description:
              'One-line summary of what was purchased; the purchase line by line is in line_items',
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
          line_items: {
            anyOf: [
              {
                items: {
                  $ref: '#/$defs/invoice_extraction__InvoiceLineItem',
                },
                type: 'array',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The priced lines of the invoice, in the order printed, fees and discounts included; never the subtotal, tax, total or payment lines',
            title: 'Line Items',
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
            description: "Total VAT or tax amount, in the invoice's currency",
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
            description: 'VAT rates applied, as percentages: 20 for 20 %',
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
  'invoice_extraction.extract_invoice_pages': {
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
          PageContent: {
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
            title: 'PageContent',
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
        properties: {
          items: {
            items: {
              $ref: '#/$defs/PageContent',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[PageContent]',
        type: 'object',
      },
      multiplicity: 'variable',
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
                description: "Net amount excluding taxes, in the invoice's currency",
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
                description: "Total amount including taxes, in the invoice's currency",
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
              currency: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  "ISO 4217 code of the currency the invoice's totals and lines are expressed in, three uppercase letters such as EUR, USD or GBP; never the currency of a converted amount or of a card payment in another currency. Empty when the document does not determine it",
                title: 'Currency',
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
                description:
                  'One-line summary of what was purchased; the purchase line by line is in line_items',
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
              line_items: {
                anyOf: [
                  {
                    items: {
                      $ref: '#/$defs/invoice_extraction__InvoiceLineItem',
                    },
                    type: 'array',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  'The priced lines of the invoice, in the order printed, fees and discounts included; never the subtotal, tax, total or payment lines',
                title: 'Line Items',
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
                description: "Total VAT or tax amount, in the invoice's currency",
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
                description: 'VAT rates applied, as percentages: 20 for 20 %',
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
          invoice_extraction__InvoiceLineItem: {
            description:
              'One priced line of an invoice or a receipt, as printed: a product, a service, a fee or a discount',
            properties: {
              amount: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  "Total of the line, in the invoice's currency, as printed; negative for a discount or a refund",
                title: 'Amount',
              },
              label: {
                description:
                  'What the line is for, as printed: the product, service, fee or discount',
                title: 'Label',
                type: 'string',
              },
              quantity: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  'How many units, or how much, as printed; may be fractional for a weighed or measured item. Empty when the line prints no quantity',
                title: 'Quantity',
              },
              unit_price: {
                anyOf: [
                  {
                    type: 'number',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  "Price of one unit, in the invoice's currency, when the line prints it",
                title: 'Unit Price',
              },
            },
            required: ['label'],
            title: 'invoice_extraction__InvoiceLineItem',
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
  'invoice_extraction.extract_invoice_pages': {
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
          description: "Total amount including taxes, in the invoice's currency",
          integer: false,
          kind: 'number',
          name: 'amount_incl_tax',
          required: false,
        },
        {
          description: "Net amount excluding taxes, in the invoice's currency",
          integer: false,
          kind: 'number',
          name: 'amount_excl_tax',
          required: false,
        },
        {
          description: "Total VAT or tax amount, in the invoice's currency",
          integer: false,
          kind: 'number',
          name: 'vat_amount',
          required: false,
        },
        {
          description:
            "ISO 4217 code of the currency the invoice's totals and lines are expressed in, three uppercase letters such as EUR, USD or GBP; never the currency of a converted amount or of a card payment in another currency. Empty when the document does not determine it",
          kind: 'text',
          name: 'currency',
          required: false,
        },
        {
          description: 'VAT rates applied, as percentages: 20 for 20 %',
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
          description:
            'One-line summary of what was purchased; the purchase line by line is in line_items',
          kind: 'text',
          name: 'description',
          required: false,
        },
        {
          concept_ref: 'invoice_extraction.InvoiceLineItem',
          description:
            'The priced lines of the invoice, in the order printed, fees and discounts included; never the subtotal, tax, total or payment lines',
          item: {
            concept_ref: 'invoice_extraction.InvoiceLineItem',
            description:
              'One priced line of an invoice or a receipt, as printed: a product, a service, a fee or a discount',
            fields: [
              {
                description:
                  'What the line is for, as printed: the product, service, fee or discount',
                kind: 'text',
                name: 'label',
                required: true,
              },
              {
                description:
                  'How many units, or how much, as printed; may be fractional for a weighed or measured item. Empty when the line prints no quantity',
                integer: false,
                kind: 'number',
                name: 'quantity',
                required: false,
              },
              {
                description:
                  "Price of one unit, in the invoice's currency, when the line prints it",
                integer: false,
                kind: 'number',
                name: 'unit_price',
                required: false,
              },
              {
                description:
                  "Total of the line, in the invoice's currency, as printed; negative for a discount or a refund",
                integer: false,
                kind: 'number',
                name: 'amount',
                required: false,
              },
            ],
            kind: 'object',
            required: true,
          },
          kind: 'list',
          name: 'line_items',
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
          description: "Total amount including taxes, in the invoice's currency",
          integer: false,
          kind: 'number',
          name: 'amount_incl_tax',
          required: false,
        },
        {
          description: "Net amount excluding taxes, in the invoice's currency",
          integer: false,
          kind: 'number',
          name: 'amount_excl_tax',
          required: false,
        },
        {
          description: "Total VAT or tax amount, in the invoice's currency",
          integer: false,
          kind: 'number',
          name: 'vat_amount',
          required: false,
        },
        {
          description:
            "ISO 4217 code of the currency the invoice's totals and lines are expressed in, three uppercase letters such as EUR, USD or GBP; never the currency of a converted amount or of a card payment in another currency. Empty when the document does not determine it",
          kind: 'text',
          name: 'currency',
          required: false,
        },
        {
          description: 'VAT rates applied, as percentages: 20 for 20 %',
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
          description:
            'One-line summary of what was purchased; the purchase line by line is in line_items',
          kind: 'text',
          name: 'description',
          required: false,
        },
        {
          concept_ref: 'invoice_extraction.InvoiceLineItem',
          description:
            'The priced lines of the invoice, in the order printed, fees and discounts included; never the subtotal, tax, total or payment lines',
          item: {
            concept_ref: 'invoice_extraction.InvoiceLineItem',
            description:
              'One priced line of an invoice or a receipt, as printed: a product, a service, a fee or a discount',
            fields: [
              {
                description:
                  'What the line is for, as printed: the product, service, fee or discount',
                kind: 'text',
                name: 'label',
                required: true,
              },
              {
                description:
                  'How many units, or how much, as printed; may be fractional for a weighed or measured item. Empty when the line prints no quantity',
                integer: false,
                kind: 'number',
                name: 'quantity',
                required: false,
              },
              {
                description:
                  "Price of one unit, in the invoice's currency, when the line prints it",
                integer: false,
                kind: 'number',
                name: 'unit_price',
                required: false,
              },
              {
                description:
                  "Total of the line, in the invoice's currency, as printed; negative for a discount or a refund",
                integer: false,
                kind: 'number',
                name: 'amount',
                required: false,
              },
            ],
            kind: 'object',
            required: true,
          },
          kind: 'list',
          name: 'line_items',
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
  'invoice_extraction.extract_invoice_pages': {
    field: {
      concept_ref: 'native.Page',
      description:
        'The content of a page of a document, comprising text and linked images and an optional page view image',
      item: {
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
        kind: 'object',
        required: true,
      },
      kind: 'list',
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
            description: "Total amount including taxes, in the invoice's currency",
            integer: false,
            kind: 'number',
            name: 'amount_incl_tax',
            required: false,
          },
          {
            description: "Net amount excluding taxes, in the invoice's currency",
            integer: false,
            kind: 'number',
            name: 'amount_excl_tax',
            required: false,
          },
          {
            description: "Total VAT or tax amount, in the invoice's currency",
            integer: false,
            kind: 'number',
            name: 'vat_amount',
            required: false,
          },
          {
            description:
              "ISO 4217 code of the currency the invoice's totals and lines are expressed in, three uppercase letters such as EUR, USD or GBP; never the currency of a converted amount or of a card payment in another currency. Empty when the document does not determine it",
            kind: 'text',
            name: 'currency',
            required: false,
          },
          {
            description: 'VAT rates applied, as percentages: 20 for 20 %',
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
            description:
              'One-line summary of what was purchased; the purchase line by line is in line_items',
            kind: 'text',
            name: 'description',
            required: false,
          },
          {
            concept_ref: 'invoice_extraction.InvoiceLineItem',
            description:
              'The priced lines of the invoice, in the order printed, fees and discounts included; never the subtotal, tax, total or payment lines',
            item: {
              concept_ref: 'invoice_extraction.InvoiceLineItem',
              description:
                'One priced line of an invoice or a receipt, as printed: a product, a service, a fee or a discount',
              fields: [
                {
                  description:
                    'What the line is for, as printed: the product, service, fee or discount',
                  kind: 'text',
                  name: 'label',
                  required: true,
                },
                {
                  description:
                    'How many units, or how much, as printed; may be fractional for a weighed or measured item. Empty when the line prints no quantity',
                  integer: false,
                  kind: 'number',
                  name: 'quantity',
                  required: false,
                },
                {
                  description:
                    "Price of one unit, in the invoice's currency, when the line prints it",
                  integer: false,
                  kind: 'number',
                  name: 'unit_price',
                  required: false,
                },
                {
                  description:
                    "Total of the line, in the invoice's currency, as printed; negative for a discount or a refund",
                  integer: false,
                  kind: 'number',
                  name: 'amount',
                  required: false,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'line_items',
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
  'invoice_extraction.extract_invoice': 'Extract invoice information from an invoice page',
  'invoice_extraction.extract_invoice_data':
    'Extract invoice information from an invoice text transcript and page view',
  'invoice_extraction.extract_invoice_pages':
    'Extract page contents (text and images) from the invoice document, with full page views',
  'invoice_extraction.process_invoice': 'Process relevant information from an invoice',
};

export const DOMAIN_DESCRIPTION: string | null =
  'Extracting structured invoice data from documents, supporting both formal bills and simple receipts';
