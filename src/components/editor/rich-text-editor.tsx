import React, { useCallback, useEffect, useMemo, useRef } from "react";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import ImageIcon from "@mui/icons-material/Image";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import WrapTextIcon from "@mui/icons-material/WrapText";
import { IconButton, Stack, Tooltip, Divider, ButtonGroup, Button, GlobalStyles } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
// import "@tiptap/core/styles.css";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

const HEADING_LEVELS = [
  { level: 1, label: "H1" },
  { level: 2, label: "H2" },
  { level: 3, label: "H3" },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const valueRef = useRef(value);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({
          placeholder: placeholder || "Write something amazing...",
        }),
        Image.configure({
          inline: false,
          allowBase64: true,
        }),
        Link.configure({
          openOnClick: false,
        }),
        Youtube.configure({
          width: 640,
          height: 360,
          controls: true,
          nocookie: true,
        }),
      ],
      content: value || "",
      editable: !disabled,
      editorProps: {
        attributes: {
          class:
            "tiptap-editor prose prose-sm sm:prose-base focus:outline-none",
        },
      },
      onUpdate: ({ editor: instance }) => {
        const html = instance.getHTML();
        if (html !== valueRef.current) {
          valueRef.current = html;
          onChange(html);
        }
      },
      onBlur: () => {
        onBlur?.();
      },
    },
    [placeholder, disabled]
  );

  useEffect(() => {
    valueRef.current = value;
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false, {
        preserveWhitespace: "full",
      });
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  const toggleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      const dataUrl = await readFileAsDataUrl(file);
      editor
        .chain()
        .focus()
        .setImage({
          src: dataUrl,
        })
        .run();
    },
    [editor]
  );

  const handleYoutubeInsert = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter YouTube link");
    if (!url) return;
    const embedUrl = buildYoutubeEmbedUrl(url);
    if (!embedUrl) {
      window.alert("That doesn’t look like a valid YouTube link.");
      return;
    }
    editor
      .chain()
      .focus()
      .setYoutubeVideo({
        src: embedUrl,
        width: 640,
        height: 360,
      })
      .run();
  }, [editor]);

  const headingButtons = useMemo(
    () =>
      HEADING_LEVELS.map((heading) => ({
        ...heading,
        isActive: editor?.isActive("heading", { level: heading.level }) ?? false,
      })),
    [editor]
  );

  return (
    <div
      style={{
        border: "1px solid rgba(145, 158, 171, 0.24)",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1,
          py: 0.5,
          backgroundColor: "rgba(145, 158, 171, 0.08)",
          borderBottom: "1px solid rgba(145, 158, 171, 0.24)",
        }}
      >
        <ButtonGroup size="small" variant="text">
          {headingButtons.map((heading) => (
            <Button
              key={heading.level}
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: heading.level as 1 | 2 | 3 | 4 | 5 | 6 })
                  .run()
              }
              color={heading.isActive ? "primary" : "inherit"}
            >
              {heading.label}
            </Button>
          ))}
        </ButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        <ToolbarButton
          icon={<FormatBoldIcon fontSize="small" />}
          label="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={<FormatItalicIcon fontSize="small" />}
          label="Italic"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={<StrikethroughSIcon fontSize="small" />}
          label="Strikethrough"
          active={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor?.can().chain().focus().toggleStrike().run()}
        />

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        <ToolbarButton
          icon={<FormatListBulletedIcon fontSize="small" />}
          label="Bullet list"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={<FormatListNumberedIcon fontSize="small" />}
          label="Numbered list"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={<WrapTextIcon fontSize="small" />}
          label="Code block"
          active={editor?.isActive("codeBlock")}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          icon={<FormatQuoteIcon fontSize="small" />}
          label="Quote"
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        <ToolbarButton
          icon={<InsertLinkIcon fontSize="small" />}
          label="Add link"
          active={editor?.isActive("link")}
          onClick={toggleLink}
        />
        <ToolbarButton
          icon={<ImageIcon fontSize="small" />}
          label="Insert image"
          onClick={() => fileInputRef.current?.click()}
        />
        <ToolbarButton
          icon={<OndemandVideoIcon fontSize="small" />}
          label="Insert YouTube"
          onClick={handleYoutubeInsert}
        />
      </Stack>

      <EditorContent
        editor={editor}
        onBlur={onBlur}
        className="tiptap-editor"
        style={{
          minHeight: 280,
          padding: "0",
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (!file) return;
          await insertImage(file);
        }}
      />

      <GlobalStyles
        styles={(theme) => ({
          ".tiptap-editor": {
            minHeight: 360,
            padding: "1.5rem 2rem",
            fontSize: "1.06rem",
            lineHeight: 1.8,
            color: theme.palette.text.primary,
            caretColor: theme.palette.primary.main,
          },
          ".tiptap-editor:focus-visible": {
            outline: "none",
          },
          ".tiptap-editor p": {
            marginTop: 0,
            marginBottom: "1rem",
          },
          ".tiptap-editor h1": {
            fontSize: "2.1rem",
            fontWeight: 700,
            margin: "2.5rem 0 1rem",
          },
          ".tiptap-editor h2": {
            fontSize: "1.75rem",
            fontWeight: 600,
            margin: "2rem 0 1rem",
          },
          ".tiptap-editor h3": {
            fontSize: "1.45rem",
            fontWeight: 600,
            margin: "1.75rem 0 0.75rem",
          },
          ".tiptap-editor blockquote": {
            margin: "1.5rem 0",
            paddingLeft: "1.5rem",
            borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            color: theme.palette.text.secondary,
            fontStyle: "italic",
          },
          ".tiptap-editor pre": {
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            padding: "1rem",
            borderRadius: 8,
            fontFamily: "'Source Code Pro', monospace",
            overflowX: "auto",
          },
          ".tiptap-editor iframe": {
            width: "100%",
            minHeight: 360,
            border: 0,
            borderRadius: 12,
            margin: "1.5rem 0",
          },
          ".tiptap-editor img": {
            maxWidth: "100%",
            borderRadius: 12,
            margin: "1.5rem 0",
            boxShadow: theme.shadows[4],
          },
          ".tiptap-editor .is-editor-empty:first-of-type::before": {
            content: "attr(data-placeholder)",
            color: alpha(theme.palette.text.primary, 0.4),
            position: "absolute",
            pointerEvents: "none",
            fontStyle: "italic",
            transform: "translateY(2px)",
          },
          ".tiptap-editor .is-editor-empty::before": {
            content: "attr(data-placeholder)",
            color: alpha(theme.palette.text.primary, 0.4),
            pointerEvents: "none",
            fontStyle: "italic",
          },
          ".tiptap-editor .is-editor-empty": {
            position: "relative",
          },
          ".tiptap-editor .ProseMirror-selectednode": {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.35)}`,
            borderRadius: 12,
          },
        })}
      />
    </div>
  );
};

type ToolbarButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick, active = false, disabled }) => (
  <Tooltip title={label}>
    <span>
      <IconButton
        size="small"
        color={active ? "primary" : "default"}
        onClick={onClick}
        disabled={disabled}
        sx={(theme) => ({
          bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : undefined,
          "&:hover": {
            bgcolor: active ? alpha(theme.palette.primary.main, 0.2) : theme.palette.action.hover,
          },
        })}
      >
        {icon}
      </IconButton>
    </span>
  </Tooltip>
);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const buildYoutubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2]}`;
      }
      const paths = parsed.pathname.split("/");
      const shortsIndex = paths.indexOf("shorts");
      if (shortsIndex >= 0 && paths[shortsIndex + 1]) {
        return `https://www.youtube.com/embed/${paths[shortsIndex + 1]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
};

