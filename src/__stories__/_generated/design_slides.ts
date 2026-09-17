/**
 * Generated from data/methods/design_slides/bundle.mthds - DO NOT EDIT.
 *
 * Slide designer, an authored method. Copied verbatim from https://github.com/Pipelex/pipelex-cookbook/blob/4265d86a5551b788ccf1c7be5b00393e12c82aef/examples/b_basics/generate_visuals/design_slides/bundle.mthds (MIT).
 *
 * Regenerate with `make fixtures`. The pipes below are the author's own,
 * projected from the bundle exactly as committed: nothing is synthesized.
 * See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'slide_designer.compose_proposals_report',
  'slide_designer.generate_design_proposals_from_rough_brief',
  'slide_designer.generate_multiple_themes',
  'slide_designer.polish_brief',
  'slide_designer.render_visual_proposal',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'slide_designer.compose_proposals_report': {
    inputs: {
      brief: {
        concept_ref: 'slide_designer.SlideDesignBrief',
        item_count: null,
        json_schema: {
          description: 'Client brief for slide deck design',
          properties: {
            audience: {
              anyOf: [
                {
                  enum: ['executives', 'technical team', 'general public'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The target audience',
              title: 'Audience',
            },
            brand_guidelines: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
              title: 'Brand Guidelines',
            },
            existing_references: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Existing templates or past decks to reference or avoid',
              title: 'Existing References',
            },
            goal: {
              anyOf: [
                {
                  enum: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The goal of the presentation',
              title: 'Goal',
            },
            tone: {
              anyOf: [
                {
                  enum: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The tone of the presentation',
              title: 'Tone',
            },
            topic: {
              description: 'The main topic or subject of the presentation',
              title: 'Topic',
              type: 'string',
            },
          },
          required: ['topic'],
          title: 'slide_designer.SlideDesignBrief',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      design_proposals: {
        concept_ref: 'native.Image',
        item_count: null,
        json_schema: {
          items: {
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
            title: 'native.Image',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      polished_brief: {
        concept_ref: 'slide_designer.SlideDesignBrief',
        item_count: null,
        json_schema: {
          description: 'Client brief for slide deck design',
          properties: {
            audience: {
              anyOf: [
                {
                  enum: ['executives', 'technical team', 'general public'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The target audience',
              title: 'Audience',
            },
            brand_guidelines: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
              title: 'Brand Guidelines',
            },
            existing_references: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Existing templates or past decks to reference or avoid',
              title: 'Existing References',
            },
            goal: {
              anyOf: [
                {
                  enum: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The goal of the presentation',
              title: 'Goal',
            },
            tone: {
              anyOf: [
                {
                  enum: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The tone of the presentation',
              title: 'Tone',
            },
            topic: {
              description: 'The main topic or subject of the presentation',
              title: 'Topic',
              type: 'string',
            },
          },
          required: ['topic'],
          title: 'slide_designer.SlideDesignBrief',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      themes: {
        concept_ref: 'slide_designer.Theme',
        item_count: null,
        json_schema: {
          items: {
            $defs: {
              slide_designer__ColorPalette: {
                description: 'Color scheme for the presentation theme',
                properties: {
                  accent: {
                    description: 'Accent color for highlights',
                    title: 'Accent',
                    type: 'string',
                  },
                  background: {
                    description: 'Background color',
                    title: 'Background',
                    type: 'string',
                  },
                  primary: {
                    description: 'Primary brand color (hex or name)',
                    title: 'Primary',
                    type: 'string',
                  },
                  secondary: {
                    description: 'Secondary color for accents',
                    title: 'Secondary',
                    type: 'string',
                  },
                  text_primary: {
                    description: 'Primary text color',
                    title: 'Text Primary',
                    type: 'string',
                  },
                  text_secondary: {
                    description: 'Secondary text color for subtitles',
                    title: 'Text Secondary',
                    type: 'string',
                  },
                },
                required: [
                  'primary',
                  'secondary',
                  'accent',
                  'background',
                  'text_primary',
                  'text_secondary',
                ],
                title: 'slide_designer__ColorPalette',
                type: 'object',
              },
              slide_designer__LayoutSettings: {
                description: 'Layout configuration for slides',
                properties: {
                  alignment: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Default content alignment (e.g., left, center, right)',
                    title: 'Alignment',
                  },
                  aspect_ratio: {
                    description: 'Slide aspect ratio',
                    enum: ['16:9', '4:3', '1:1'],
                    title: 'Aspect Ratio',
                    type: 'string',
                  },
                  margins: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Margin style (e.g., narrow, standard, wide)',
                    title: 'Margins',
                  },
                },
                required: ['aspect_ratio'],
                title: 'slide_designer__LayoutSettings',
                type: 'object',
              },
              slide_designer__StyleSettings: {
                description: 'Visual style preferences for the presentation',
                properties: {
                  graphic_style: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Style for graphics and illustrations',
                    title: 'Graphic Style',
                  },
                  icon_style: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Style for icons (e.g., outline, filled, flat)',
                    title: 'Icon Style',
                  },
                  overall: {
                    description: 'Overall visual style (e.g., minimal, corporate, creative)',
                    title: 'Overall',
                    type: 'string',
                  },
                },
                required: ['overall'],
                title: 'slide_designer__StyleSettings',
                type: 'object',
              },
              slide_designer__Typography: {
                description: 'Font and text styling for the presentation',
                properties: {
                  body_style: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Style description for body text',
                    title: 'Body Style',
                  },
                  font_family: {
                    description: 'Primary font family name',
                    title: 'Font Family',
                    type: 'string',
                  },
                  heading_style: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Style description for headings (e.g., bold, uppercase)',
                    title: 'Heading Style',
                  },
                },
                required: ['font_family'],
                title: 'slide_designer__Typography',
                type: 'object',
              },
            },
            description: 'Complete presentation theme with colors, typography, layout, and style',
            properties: {
              colors: {
                $ref: '#/$defs/slide_designer__ColorPalette',
                description: 'Color palette for the theme',
              },
              exclusions: {
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
                  'Elements to avoid in the design (e.g., no gradients, no stock photos)',
                title: 'Exclusions',
              },
              layout: {
                $ref: '#/$defs/slide_designer__LayoutSettings',
                description: 'Layout configuration',
              },
              name: {
                description: 'Theme name identifier',
                title: 'Name',
                type: 'string',
              },
              style: {
                $ref: '#/$defs/slide_designer__StyleSettings',
                description: 'Visual style settings',
              },
              typography: {
                $ref: '#/$defs/slide_designer__Typography',
                description: 'Typography settings',
              },
            },
            required: ['name', 'colors', 'typography', 'layout', 'style'],
            title: 'slide_designer.Theme',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'native.Html',
      item_count: null,
      json_schema: {
        description: 'HTML content',
        properties: {
          css_class: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The CSS class of the content',
            title: 'Css Class',
          },
          inner_html: {
            description: 'The inner HTML of the content',
            title: 'Inner Html',
            type: 'string',
          },
        },
        required: ['inner_html'],
        title: 'native.Html',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'slide_designer.generate_design_proposals_from_rough_brief': {
    inputs: {
      brief: {
        concept_ref: 'slide_designer.SlideDesignBrief',
        item_count: null,
        json_schema: {
          description: 'Client brief for slide deck design',
          properties: {
            audience: {
              anyOf: [
                {
                  enum: ['executives', 'technical team', 'general public'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The target audience',
              title: 'Audience',
            },
            brand_guidelines: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
              title: 'Brand Guidelines',
            },
            existing_references: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Existing templates or past decks to reference or avoid',
              title: 'Existing References',
            },
            goal: {
              anyOf: [
                {
                  enum: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The goal of the presentation',
              title: 'Goal',
            },
            tone: {
              anyOf: [
                {
                  enum: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The tone of the presentation',
              title: 'Tone',
            },
            topic: {
              description: 'The main topic or subject of the presentation',
              title: 'Topic',
              type: 'string',
            },
          },
          required: ['topic'],
          title: 'slide_designer.SlideDesignBrief',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'native.Html',
      item_count: null,
      json_schema: {
        description: 'HTML content',
        properties: {
          css_class: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The CSS class of the content',
            title: 'Css Class',
          },
          inner_html: {
            description: 'The inner HTML of the content',
            title: 'Inner Html',
            type: 'string',
          },
        },
        required: ['inner_html'],
        title: 'native.Html',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'slide_designer.generate_multiple_themes': {
    inputs: {
      polished_brief: {
        concept_ref: 'slide_designer.SlideDesignBrief',
        item_count: null,
        json_schema: {
          description: 'Client brief for slide deck design',
          properties: {
            audience: {
              anyOf: [
                {
                  enum: ['executives', 'technical team', 'general public'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The target audience',
              title: 'Audience',
            },
            brand_guidelines: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
              title: 'Brand Guidelines',
            },
            existing_references: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Existing templates or past decks to reference or avoid',
              title: 'Existing References',
            },
            goal: {
              anyOf: [
                {
                  enum: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The goal of the presentation',
              title: 'Goal',
            },
            tone: {
              anyOf: [
                {
                  enum: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The tone of the presentation',
              title: 'Tone',
            },
            topic: {
              description: 'The main topic or subject of the presentation',
              title: 'Topic',
              type: 'string',
            },
          },
          required: ['topic'],
          title: 'slide_designer.SlideDesignBrief',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'slide_designer.Theme',
      item_count: null,
      json_schema: {
        $defs: {
          slide_designer__ColorPalette: {
            description: 'Color scheme for the presentation theme',
            properties: {
              accent: {
                description: 'Accent color for highlights',
                title: 'Accent',
                type: 'string',
              },
              background: {
                description: 'Background color',
                title: 'Background',
                type: 'string',
              },
              primary: {
                description: 'Primary brand color (hex or name)',
                title: 'Primary',
                type: 'string',
              },
              secondary: {
                description: 'Secondary color for accents',
                title: 'Secondary',
                type: 'string',
              },
              text_primary: {
                description: 'Primary text color',
                title: 'Text Primary',
                type: 'string',
              },
              text_secondary: {
                description: 'Secondary text color for subtitles',
                title: 'Text Secondary',
                type: 'string',
              },
            },
            required: [
              'primary',
              'secondary',
              'accent',
              'background',
              'text_primary',
              'text_secondary',
            ],
            title: 'slide_designer__ColorPalette',
            type: 'object',
          },
          slide_designer__LayoutSettings: {
            description: 'Layout configuration for slides',
            properties: {
              alignment: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Default content alignment (e.g., left, center, right)',
                title: 'Alignment',
              },
              aspect_ratio: {
                description: 'Slide aspect ratio',
                enum: ['16:9', '4:3', '1:1'],
                title: 'Aspect Ratio',
                type: 'string',
              },
              margins: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Margin style (e.g., narrow, standard, wide)',
                title: 'Margins',
              },
            },
            required: ['aspect_ratio'],
            title: 'slide_designer__LayoutSettings',
            type: 'object',
          },
          slide_designer__StyleSettings: {
            description: 'Visual style preferences for the presentation',
            properties: {
              graphic_style: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Style for graphics and illustrations',
                title: 'Graphic Style',
              },
              icon_style: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Style for icons (e.g., outline, filled, flat)',
                title: 'Icon Style',
              },
              overall: {
                description: 'Overall visual style (e.g., minimal, corporate, creative)',
                title: 'Overall',
                type: 'string',
              },
            },
            required: ['overall'],
            title: 'slide_designer__StyleSettings',
            type: 'object',
          },
          slide_designer__Theme: {
            description: 'Complete presentation theme with colors, typography, layout, and style',
            properties: {
              colors: {
                $ref: '#/$defs/slide_designer__ColorPalette',
                description: 'Color palette for the theme',
              },
              exclusions: {
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
                  'Elements to avoid in the design (e.g., no gradients, no stock photos)',
                title: 'Exclusions',
              },
              layout: {
                $ref: '#/$defs/slide_designer__LayoutSettings',
                description: 'Layout configuration',
              },
              name: {
                description: 'Theme name identifier',
                title: 'Name',
                type: 'string',
              },
              style: {
                $ref: '#/$defs/slide_designer__StyleSettings',
                description: 'Visual style settings',
              },
              typography: {
                $ref: '#/$defs/slide_designer__Typography',
                description: 'Typography settings',
              },
            },
            required: ['name', 'colors', 'typography', 'layout', 'style'],
            title: 'slide_designer__Theme',
            type: 'object',
          },
          slide_designer__Typography: {
            description: 'Font and text styling for the presentation',
            properties: {
              body_style: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Style description for body text',
                title: 'Body Style',
              },
              font_family: {
                description: 'Primary font family name',
                title: 'Font Family',
                type: 'string',
              },
              heading_style: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Style description for headings (e.g., bold, uppercase)',
                title: 'Heading Style',
              },
            },
            required: ['font_family'],
            title: 'slide_designer__Typography',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/slide_designer__Theme',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[slide_designer__Theme]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'slide_designer.polish_brief': {
    inputs: {
      brief: {
        concept_ref: 'slide_designer.SlideDesignBrief',
        item_count: null,
        json_schema: {
          description: 'Client brief for slide deck design',
          properties: {
            audience: {
              anyOf: [
                {
                  enum: ['executives', 'technical team', 'general public'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The target audience',
              title: 'Audience',
            },
            brand_guidelines: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
              title: 'Brand Guidelines',
            },
            existing_references: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Existing templates or past decks to reference or avoid',
              title: 'Existing References',
            },
            goal: {
              anyOf: [
                {
                  enum: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The goal of the presentation',
              title: 'Goal',
            },
            tone: {
              anyOf: [
                {
                  enum: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The tone of the presentation',
              title: 'Tone',
            },
            topic: {
              description: 'The main topic or subject of the presentation',
              title: 'Topic',
              type: 'string',
            },
          },
          required: ['topic'],
          title: 'slide_designer.SlideDesignBrief',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'slide_designer.SlideDesignBrief',
      item_count: null,
      json_schema: {
        description: 'Client brief for slide deck design',
        properties: {
          audience: {
            anyOf: [
              {
                enum: ['executives', 'technical team', 'general public'],
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The target audience',
            title: 'Audience',
          },
          brand_guidelines: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
            title: 'Brand Guidelines',
          },
          existing_references: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'Existing templates or past decks to reference or avoid',
            title: 'Existing References',
          },
          goal: {
            anyOf: [
              {
                enum: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The goal of the presentation',
            title: 'Goal',
          },
          tone: {
            anyOf: [
              {
                enum: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The tone of the presentation',
            title: 'Tone',
          },
          topic: {
            description: 'The main topic or subject of the presentation',
            title: 'Topic',
            type: 'string',
          },
        },
        required: ['topic'],
        title: 'slide_designer.SlideDesignBrief',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'slide_designer.render_visual_proposal': {
    inputs: {
      theme: {
        concept_ref: 'slide_designer.Theme',
        item_count: null,
        json_schema: {
          $defs: {
            slide_designer__ColorPalette: {
              description: 'Color scheme for the presentation theme',
              properties: {
                accent: {
                  description: 'Accent color for highlights',
                  title: 'Accent',
                  type: 'string',
                },
                background: {
                  description: 'Background color',
                  title: 'Background',
                  type: 'string',
                },
                primary: {
                  description: 'Primary brand color (hex or name)',
                  title: 'Primary',
                  type: 'string',
                },
                secondary: {
                  description: 'Secondary color for accents',
                  title: 'Secondary',
                  type: 'string',
                },
                text_primary: {
                  description: 'Primary text color',
                  title: 'Text Primary',
                  type: 'string',
                },
                text_secondary: {
                  description: 'Secondary text color for subtitles',
                  title: 'Text Secondary',
                  type: 'string',
                },
              },
              required: [
                'primary',
                'secondary',
                'accent',
                'background',
                'text_primary',
                'text_secondary',
              ],
              title: 'slide_designer__ColorPalette',
              type: 'object',
            },
            slide_designer__LayoutSettings: {
              description: 'Layout configuration for slides',
              properties: {
                alignment: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Default content alignment (e.g., left, center, right)',
                  title: 'Alignment',
                },
                aspect_ratio: {
                  description: 'Slide aspect ratio',
                  enum: ['16:9', '4:3', '1:1'],
                  title: 'Aspect Ratio',
                  type: 'string',
                },
                margins: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Margin style (e.g., narrow, standard, wide)',
                  title: 'Margins',
                },
              },
              required: ['aspect_ratio'],
              title: 'slide_designer__LayoutSettings',
              type: 'object',
            },
            slide_designer__StyleSettings: {
              description: 'Visual style preferences for the presentation',
              properties: {
                graphic_style: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Style for graphics and illustrations',
                  title: 'Graphic Style',
                },
                icon_style: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Style for icons (e.g., outline, filled, flat)',
                  title: 'Icon Style',
                },
                overall: {
                  description: 'Overall visual style (e.g., minimal, corporate, creative)',
                  title: 'Overall',
                  type: 'string',
                },
              },
              required: ['overall'],
              title: 'slide_designer__StyleSettings',
              type: 'object',
            },
            slide_designer__Typography: {
              description: 'Font and text styling for the presentation',
              properties: {
                body_style: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Style description for body text',
                  title: 'Body Style',
                },
                font_family: {
                  description: 'Primary font family name',
                  title: 'Font Family',
                  type: 'string',
                },
                heading_style: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Style description for headings (e.g., bold, uppercase)',
                  title: 'Heading Style',
                },
              },
              required: ['font_family'],
              title: 'slide_designer__Typography',
              type: 'object',
            },
          },
          description: 'Complete presentation theme with colors, typography, layout, and style',
          properties: {
            colors: {
              $ref: '#/$defs/slide_designer__ColorPalette',
              description: 'Color palette for the theme',
            },
            exclusions: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Elements to avoid in the design (e.g., no gradients, no stock photos)',
              title: 'Exclusions',
            },
            layout: {
              $ref: '#/$defs/slide_designer__LayoutSettings',
              description: 'Layout configuration',
            },
            name: {
              description: 'Theme name identifier',
              title: 'Name',
              type: 'string',
            },
            style: {
              $ref: '#/$defs/slide_designer__StyleSettings',
              description: 'Visual style settings',
            },
            typography: {
              $ref: '#/$defs/slide_designer__Typography',
              description: 'Typography settings',
            },
          },
          required: ['name', 'colors', 'typography', 'layout', 'style'],
          title: 'slide_designer.Theme',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'native.Image',
      item_count: null,
      json_schema: {
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
        title: 'native.Image',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'slide_designer.compose_proposals_report': {
    fields: [
      {
        concept_ref: 'slide_designer.SlideDesignBrief',
        description: 'Client brief for slide deck design',
        fields: [
          {
            description: 'The main topic or subject of the presentation',
            kind: 'text',
            name: 'topic',
            required: true,
          },
          {
            description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
            kind: 'text',
            name: 'brand_guidelines',
            required: false,
          },
          {
            choices: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            description: 'The tone of the presentation',
            kind: 'enum',
            name: 'tone',
            required: false,
          },
          {
            description: 'Existing templates or past decks to reference or avoid',
            kind: 'text',
            name: 'existing_references',
            required: false,
          },
          {
            choices: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
            description: 'The goal of the presentation',
            kind: 'enum',
            name: 'goal',
            required: false,
          },
          {
            choices: ['executives', 'technical team', 'general public'],
            description: 'The target audience',
            kind: 'enum',
            name: 'audience',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'brief',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'slide_designer.SlideDesignBrief',
        description: 'Client brief for slide deck design',
        fields: [
          {
            description: 'The main topic or subject of the presentation',
            kind: 'text',
            name: 'topic',
            required: true,
          },
          {
            description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
            kind: 'text',
            name: 'brand_guidelines',
            required: false,
          },
          {
            choices: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            description: 'The tone of the presentation',
            kind: 'enum',
            name: 'tone',
            required: false,
          },
          {
            description: 'Existing templates or past decks to reference or avoid',
            kind: 'text',
            name: 'existing_references',
            required: false,
          },
          {
            choices: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
            description: 'The goal of the presentation',
            kind: 'enum',
            name: 'goal',
            required: false,
          },
          {
            choices: ['executives', 'technical team', 'general public'],
            description: 'The target audience',
            kind: 'enum',
            name: 'audience',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'polished_brief',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'slide_designer.Theme',
        description: 'Complete presentation theme with colors, typography, layout, and style',
        gating: false,
        item: {
          concept_ref: 'slide_designer.Theme',
          description: 'Complete presentation theme with colors, typography, layout, and style',
          fields: [
            {
              description: 'Theme name identifier',
              kind: 'text',
              name: 'name',
              required: true,
            },
            {
              concept_ref: 'slide_designer.ColorPalette',
              description: 'Color palette for the theme',
              fields: [
                {
                  description: 'Primary brand color (hex or name)',
                  kind: 'text',
                  name: 'primary',
                  required: true,
                },
                {
                  description: 'Secondary color for accents',
                  kind: 'text',
                  name: 'secondary',
                  required: true,
                },
                {
                  description: 'Accent color for highlights',
                  kind: 'text',
                  name: 'accent',
                  required: true,
                },
                {
                  description: 'Background color',
                  kind: 'text',
                  name: 'background',
                  required: true,
                },
                {
                  description: 'Primary text color',
                  kind: 'text',
                  name: 'text_primary',
                  required: true,
                },
                {
                  description: 'Secondary text color for subtitles',
                  kind: 'text',
                  name: 'text_secondary',
                  required: true,
                },
              ],
              kind: 'object',
              name: 'colors',
              required: true,
            },
            {
              concept_ref: 'slide_designer.Typography',
              description: 'Typography settings',
              fields: [
                {
                  description: 'Primary font family name',
                  kind: 'text',
                  name: 'font_family',
                  required: true,
                },
                {
                  description: 'Style description for headings (e.g., bold, uppercase)',
                  kind: 'text',
                  name: 'heading_style',
                  required: false,
                },
                {
                  description: 'Style description for body text',
                  kind: 'text',
                  name: 'body_style',
                  required: false,
                },
              ],
              kind: 'object',
              name: 'typography',
              required: true,
            },
            {
              concept_ref: 'slide_designer.LayoutSettings',
              description: 'Layout configuration',
              fields: [
                {
                  choices: ['16:9', '4:3', '1:1'],
                  description: 'Slide aspect ratio',
                  kind: 'enum',
                  name: 'aspect_ratio',
                  required: true,
                },
                {
                  description: 'Margin style (e.g., narrow, standard, wide)',
                  kind: 'text',
                  name: 'margins',
                  required: false,
                },
                {
                  description: 'Default content alignment (e.g., left, center, right)',
                  kind: 'text',
                  name: 'alignment',
                  required: false,
                },
              ],
              kind: 'object',
              name: 'layout',
              required: true,
            },
            {
              concept_ref: 'slide_designer.StyleSettings',
              description: 'Visual style settings',
              fields: [
                {
                  description: 'Overall visual style (e.g., minimal, corporate, creative)',
                  kind: 'text',
                  name: 'overall',
                  required: true,
                },
                {
                  description: 'Style for icons (e.g., outline, filled, flat)',
                  kind: 'text',
                  name: 'icon_style',
                  required: false,
                },
                {
                  description: 'Style for graphics and illustrations',
                  kind: 'text',
                  name: 'graphic_style',
                  required: false,
                },
              ],
              kind: 'object',
              name: 'style',
              required: true,
            },
            {
              description: 'Elements to avoid in the design (e.g., no gradients, no stock photos)',
              kind: 'text',
              name: 'exclusions',
              required: false,
            },
          ],
          kind: 'object',
          required: true,
        },
        kind: 'list',
        name: 'themes',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Image',
        description: 'An image',
        gating: false,
        item: {
          concept_ref: 'native.Image',
          description: 'An image',
          kind: 'image',
          required: true,
        },
        kind: 'list',
        name: 'design_proposals',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'slide_designer.generate_design_proposals_from_rough_brief': {
    fields: [
      {
        concept_ref: 'slide_designer.SlideDesignBrief',
        description: 'Client brief for slide deck design',
        fields: [
          {
            description: 'The main topic or subject of the presentation',
            kind: 'text',
            name: 'topic',
            required: true,
          },
          {
            description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
            kind: 'text',
            name: 'brand_guidelines',
            required: false,
          },
          {
            choices: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            description: 'The tone of the presentation',
            kind: 'enum',
            name: 'tone',
            required: false,
          },
          {
            description: 'Existing templates or past decks to reference or avoid',
            kind: 'text',
            name: 'existing_references',
            required: false,
          },
          {
            choices: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
            description: 'The goal of the presentation',
            kind: 'enum',
            name: 'goal',
            required: false,
          },
          {
            choices: ['executives', 'technical team', 'general public'],
            description: 'The target audience',
            kind: 'enum',
            name: 'audience',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'brief',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'slide_designer.generate_multiple_themes': {
    fields: [
      {
        concept_ref: 'slide_designer.SlideDesignBrief',
        description: 'Client brief for slide deck design',
        fields: [
          {
            description: 'The main topic or subject of the presentation',
            kind: 'text',
            name: 'topic',
            required: true,
          },
          {
            description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
            kind: 'text',
            name: 'brand_guidelines',
            required: false,
          },
          {
            choices: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            description: 'The tone of the presentation',
            kind: 'enum',
            name: 'tone',
            required: false,
          },
          {
            description: 'Existing templates or past decks to reference or avoid',
            kind: 'text',
            name: 'existing_references',
            required: false,
          },
          {
            choices: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
            description: 'The goal of the presentation',
            kind: 'enum',
            name: 'goal',
            required: false,
          },
          {
            choices: ['executives', 'technical team', 'general public'],
            description: 'The target audience',
            kind: 'enum',
            name: 'audience',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'polished_brief',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'slide_designer.polish_brief': {
    fields: [
      {
        concept_ref: 'slide_designer.SlideDesignBrief',
        description: 'Client brief for slide deck design',
        fields: [
          {
            description: 'The main topic or subject of the presentation',
            kind: 'text',
            name: 'topic',
            required: true,
          },
          {
            description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
            kind: 'text',
            name: 'brand_guidelines',
            required: false,
          },
          {
            choices: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            description: 'The tone of the presentation',
            kind: 'enum',
            name: 'tone',
            required: false,
          },
          {
            description: 'Existing templates or past decks to reference or avoid',
            kind: 'text',
            name: 'existing_references',
            required: false,
          },
          {
            choices: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
            description: 'The goal of the presentation',
            kind: 'enum',
            name: 'goal',
            required: false,
          },
          {
            choices: ['executives', 'technical team', 'general public'],
            description: 'The target audience',
            kind: 'enum',
            name: 'audience',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'brief',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'slide_designer.render_visual_proposal': {
    fields: [
      {
        concept_ref: 'slide_designer.Theme',
        description: 'Complete presentation theme with colors, typography, layout, and style',
        fields: [
          {
            description: 'Theme name identifier',
            kind: 'text',
            name: 'name',
            required: true,
          },
          {
            concept_ref: 'slide_designer.ColorPalette',
            description: 'Color palette for the theme',
            fields: [
              {
                description: 'Primary brand color (hex or name)',
                kind: 'text',
                name: 'primary',
                required: true,
              },
              {
                description: 'Secondary color for accents',
                kind: 'text',
                name: 'secondary',
                required: true,
              },
              {
                description: 'Accent color for highlights',
                kind: 'text',
                name: 'accent',
                required: true,
              },
              {
                description: 'Background color',
                kind: 'text',
                name: 'background',
                required: true,
              },
              {
                description: 'Primary text color',
                kind: 'text',
                name: 'text_primary',
                required: true,
              },
              {
                description: 'Secondary text color for subtitles',
                kind: 'text',
                name: 'text_secondary',
                required: true,
              },
            ],
            kind: 'object',
            name: 'colors',
            required: true,
          },
          {
            concept_ref: 'slide_designer.Typography',
            description: 'Typography settings',
            fields: [
              {
                description: 'Primary font family name',
                kind: 'text',
                name: 'font_family',
                required: true,
              },
              {
                description: 'Style description for headings (e.g., bold, uppercase)',
                kind: 'text',
                name: 'heading_style',
                required: false,
              },
              {
                description: 'Style description for body text',
                kind: 'text',
                name: 'body_style',
                required: false,
              },
            ],
            kind: 'object',
            name: 'typography',
            required: true,
          },
          {
            concept_ref: 'slide_designer.LayoutSettings',
            description: 'Layout configuration',
            fields: [
              {
                choices: ['16:9', '4:3', '1:1'],
                description: 'Slide aspect ratio',
                kind: 'enum',
                name: 'aspect_ratio',
                required: true,
              },
              {
                description: 'Margin style (e.g., narrow, standard, wide)',
                kind: 'text',
                name: 'margins',
                required: false,
              },
              {
                description: 'Default content alignment (e.g., left, center, right)',
                kind: 'text',
                name: 'alignment',
                required: false,
              },
            ],
            kind: 'object',
            name: 'layout',
            required: true,
          },
          {
            concept_ref: 'slide_designer.StyleSettings',
            description: 'Visual style settings',
            fields: [
              {
                description: 'Overall visual style (e.g., minimal, corporate, creative)',
                kind: 'text',
                name: 'overall',
                required: true,
              },
              {
                description: 'Style for icons (e.g., outline, filled, flat)',
                kind: 'text',
                name: 'icon_style',
                required: false,
              },
              {
                description: 'Style for graphics and illustrations',
                kind: 'text',
                name: 'graphic_style',
                required: false,
              },
            ],
            kind: 'object',
            name: 'style',
            required: true,
          },
          {
            description: 'Elements to avoid in the design (e.g., no gradients, no stock photos)',
            kind: 'text',
            name: 'exclusions',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'theme',
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
  'slide_designer.compose_proposals_report': {
    field: {
      concept_ref: 'native.Html',
      description: 'HTML content',
      fields: [
        {
          description: 'The inner HTML of the content',
          kind: 'text',
          name: 'inner_html',
          required: true,
        },
        {
          description: 'The CSS class of the content',
          kind: 'text',
          name: 'css_class',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'slide_designer.generate_design_proposals_from_rough_brief': {
    field: {
      concept_ref: 'native.Html',
      description: 'HTML content',
      fields: [
        {
          description: 'The inner HTML of the content',
          kind: 'text',
          name: 'inner_html',
          required: true,
        },
        {
          description: 'The CSS class of the content',
          kind: 'text',
          name: 'css_class',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'slide_designer.generate_multiple_themes': {
    field: {
      concept_ref: 'slide_designer.Theme',
      description: 'Complete presentation theme with colors, typography, layout, and style',
      item: {
        concept_ref: 'slide_designer.Theme',
        description: 'Complete presentation theme with colors, typography, layout, and style',
        fields: [
          {
            description: 'Theme name identifier',
            kind: 'text',
            name: 'name',
            required: true,
          },
          {
            concept_ref: 'slide_designer.ColorPalette',
            description: 'Color palette for the theme',
            fields: [
              {
                description: 'Primary brand color (hex or name)',
                kind: 'text',
                name: 'primary',
                required: true,
              },
              {
                description: 'Secondary color for accents',
                kind: 'text',
                name: 'secondary',
                required: true,
              },
              {
                description: 'Accent color for highlights',
                kind: 'text',
                name: 'accent',
                required: true,
              },
              {
                description: 'Background color',
                kind: 'text',
                name: 'background',
                required: true,
              },
              {
                description: 'Primary text color',
                kind: 'text',
                name: 'text_primary',
                required: true,
              },
              {
                description: 'Secondary text color for subtitles',
                kind: 'text',
                name: 'text_secondary',
                required: true,
              },
            ],
            kind: 'object',
            name: 'colors',
            required: true,
          },
          {
            concept_ref: 'slide_designer.Typography',
            description: 'Typography settings',
            fields: [
              {
                description: 'Primary font family name',
                kind: 'text',
                name: 'font_family',
                required: true,
              },
              {
                description: 'Style description for headings (e.g., bold, uppercase)',
                kind: 'text',
                name: 'heading_style',
                required: false,
              },
              {
                description: 'Style description for body text',
                kind: 'text',
                name: 'body_style',
                required: false,
              },
            ],
            kind: 'object',
            name: 'typography',
            required: true,
          },
          {
            concept_ref: 'slide_designer.LayoutSettings',
            description: 'Layout configuration',
            fields: [
              {
                choices: ['16:9', '4:3', '1:1'],
                description: 'Slide aspect ratio',
                kind: 'enum',
                name: 'aspect_ratio',
                required: true,
              },
              {
                description: 'Margin style (e.g., narrow, standard, wide)',
                kind: 'text',
                name: 'margins',
                required: false,
              },
              {
                description: 'Default content alignment (e.g., left, center, right)',
                kind: 'text',
                name: 'alignment',
                required: false,
              },
            ],
            kind: 'object',
            name: 'layout',
            required: true,
          },
          {
            concept_ref: 'slide_designer.StyleSettings',
            description: 'Visual style settings',
            fields: [
              {
                description: 'Overall visual style (e.g., minimal, corporate, creative)',
                kind: 'text',
                name: 'overall',
                required: true,
              },
              {
                description: 'Style for icons (e.g., outline, filled, flat)',
                kind: 'text',
                name: 'icon_style',
                required: false,
              },
              {
                description: 'Style for graphics and illustrations',
                kind: 'text',
                name: 'graphic_style',
                required: false,
              },
            ],
            kind: 'object',
            name: 'style',
            required: true,
          },
          {
            description: 'Elements to avoid in the design (e.g., no gradients, no stock photos)',
            kind: 'text',
            name: 'exclusions',
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
  'slide_designer.polish_brief': {
    field: {
      concept_ref: 'slide_designer.SlideDesignBrief',
      description: 'Client brief for slide deck design',
      fields: [
        {
          description: 'The main topic or subject of the presentation',
          kind: 'text',
          name: 'topic',
          required: true,
        },
        {
          description: "The client's brand guidelines (colors, fonts, logo usage, etc.)",
          kind: 'text',
          name: 'brand_guidelines',
          required: false,
        },
        {
          choices: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
          description: 'The tone of the presentation',
          kind: 'enum',
          name: 'tone',
          required: false,
        },
        {
          description: 'Existing templates or past decks to reference or avoid',
          kind: 'text',
          name: 'existing_references',
          required: false,
        },
        {
          choices: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
          description: 'The goal of the presentation',
          kind: 'enum',
          name: 'goal',
          required: false,
        },
        {
          choices: ['executives', 'technical team', 'general public'],
          description: 'The target audience',
          kind: 'enum',
          name: 'audience',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'slide_designer.render_visual_proposal': {
    field: {
      concept_ref: 'native.Image',
      description: 'An image',
      kind: 'image',
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
  'slide_designer.compose_proposals_report':
    'Generate an HTML report presenting the design proposals',
  'slide_designer.generate_design_proposals_from_rough_brief':
    'Transform a design brief into multiple themes with visual mockups and HTML report',
  'slide_designer.generate_multiple_themes':
    'Generate a presentation theme from a polished design brief',
  'slide_designer.polish_brief':
    'Polish and complete a slide design brief by filling missing fields',
  'slide_designer.render_visual_proposal': 'Generate a visual mockup image from a theme',
};

export const DOMAIN_DESCRIPTION: string | null =
  'Data model for slide prompt generation with reusable themes';
