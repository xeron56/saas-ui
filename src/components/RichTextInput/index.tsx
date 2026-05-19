import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import type { ClipboardEvent } from 'react';
import { useEffect, useRef } from 'react';

function safeRichTextHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('#')) {
    return trimmed;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  try {
    const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const url = new URL(trimmed, origin);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      return url.href;
    }
  } catch {
    return '';
  }
  return '';
}

function safeRichTextAlign(value: string | null) {
  const normalized = (value || '').trim().toLowerCase();
  if (['left', 'center', 'right', 'justify'].includes(normalized)) {
    return normalized;
  }
  return '';
}

export function sanitizeRichText(value: string) {
  if (!value) {
    return '';
  }
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return value
      .replace(/<(script|style|iframe|object|embed|link|meta)\b[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '')
      .replace(/\sstyle=["'][^"']*["']/gi, '')
      .replace(/\salign=["'][^"']*["']/gi, '')
      .replace(/\s(href|src)=["']\s*javascript:[^"']*["']/gi, '');
  }
  const allowedTags = new Set([
    'A',
    'B',
    'BLOCKQUOTE',
    'BR',
    'DIV',
    'EM',
    'H1',
    'H2',
    'H3',
    'I',
    'LI',
    'OL',
    'P',
    'SPAN',
    'STRONG',
    'U',
    'UL',
  ]);
  const alignedTags = new Set(['BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'LI', 'P']);
  const blockedTags = new Set(['EMBED', 'IFRAME', 'LINK', 'META', 'OBJECT', 'SCRIPT', 'STYLE']);
  const documentFragment = new DOMParser().parseFromString(`<div>${value}</div>`, 'text/html');
  const wrapper = documentFragment.body.firstElementChild;
  if (!wrapper) {
    return '';
  }
  const cleanNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }
    const element = node as HTMLElement;
    Array.from(element.childNodes).forEach(cleanNode);
    if (blockedTags.has(element.tagName)) {
      element.remove();
      return;
    }
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    const href =
      element.tagName === 'A' ? safeRichTextHref(element.getAttribute('href') || '') : '';
    const textAlign = alignedTags.has(element.tagName)
      ? safeRichTextAlign(element.style.textAlign || element.getAttribute('align'))
      : '';
    Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
    if (element.tagName === 'A' && href) {
      element.setAttribute('href', href);
      element.setAttribute('rel', 'noopener noreferrer');
      element.setAttribute('target', '_blank');
    }
    if (textAlign) {
      element.style.textAlign = textAlign;
    }
  };
  Array.from(wrapper.childNodes).forEach(cleanNode);
  return wrapper.innerHTML;
}

export default function RichTextInput({
  value,
  onChange,
  rows = 4,
}: {
  value?: string;
  onChange?: (value?: string) => void;
  rows?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef('');

  useEffect(() => {
    const clean = sanitizeRichText(value || '');
    if (editorRef.current && clean !== lastValueRef.current) {
      editorRef.current.innerHTML = clean;
      lastValueRef.current = clean;
    }
  }, [value]);

  const emitChange = () => {
    const clean = sanitizeRichText(editorRef.current?.innerHTML || '');
    lastValueRef.current = clean;
    if (editorRef.current && editorRef.current.innerHTML !== clean) {
      editorRef.current.innerHTML = clean;
    }
    onChange?.(clean);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const pasteRichText = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');
    if (html) {
      document.execCommand('insertHTML', false, sanitizeRichText(html));
    } else {
      document.execCommand('insertText', false, text);
    }
    emitChange();
  };

  return (
    <div>
      <Space size={4} wrap style={{ marginBottom: 8 }}>
        <Tooltip title="Bold">
          <Button
            aria-label="Bold"
            size="small"
            icon={<BoldOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('bold')}
          />
        </Tooltip>
        <Tooltip title="Italic">
          <Button
            aria-label="Italic"
            size="small"
            icon={<ItalicOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('italic')}
          />
        </Tooltip>
        <Tooltip title="Underline">
          <Button
            aria-label="Underline"
            size="small"
            icon={<UnderlineOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('underline')}
          />
        </Tooltip>
        <Tooltip title="Bulleted list">
          <Button
            aria-label="Bulleted list"
            size="small"
            icon={<UnorderedListOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('insertUnorderedList')}
          />
        </Tooltip>
        <Tooltip title="Numbered list">
          <Button
            aria-label="Numbered list"
            size="small"
            icon={<OrderedListOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('insertOrderedList')}
          />
        </Tooltip>
        <Tooltip title="Align left">
          <Button
            aria-label="Align left"
            size="small"
            icon={<AlignLeftOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('justifyLeft')}
          />
        </Tooltip>
        <Tooltip title="Align center">
          <Button
            aria-label="Align center"
            size="small"
            icon={<AlignCenterOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('justifyCenter')}
          />
        </Tooltip>
        <Tooltip title="Align right">
          <Button
            aria-label="Align right"
            size="small"
            icon={<AlignRightOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('justifyRight')}
          />
        </Tooltip>
        <Tooltip title="Outdent">
          <Button
            aria-label="Outdent"
            size="small"
            icon={<MenuFoldOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('outdent')}
          />
        </Tooltip>
        <Tooltip title="Indent">
          <Button
            aria-label="Indent"
            size="small"
            icon={<MenuUnfoldOutlined />}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('indent')}
          />
        </Tooltip>
      </Space>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={emitChange}
        onInput={emitChange}
        onPaste={pasteRichText}
        style={{
          minHeight: rows * 32,
          padding: '8px 11px',
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          outline: 'none',
          background: '#fff',
        }}
      />
    </div>
  );
}
