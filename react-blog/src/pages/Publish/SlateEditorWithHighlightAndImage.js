import React, { useMemo, useCallback } from 'react';
import {
    createEditor,
    Transforms,
    Editor,
    Element as SlateElement,
    Text,
} from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { uploadFileAPI } from '@/apis/file'
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markup';
// 工具栏图标
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaCode,
    FaHeading,
    FaListUl,
    FaListOl,
    FaQuoteRight,
    FaLink,
    FaUndo,
    FaRedo,
    FaImage,
} from 'react-icons/fa';

// Simple HTML serializer (matching Quill output)
const escapeHtml = str =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function serializeNode(node) {
    if (Text.isText(node)) {
        let text = escapeHtml(node.text);
        if (node.bold) text = `<strong>${text}</strong>`;
        if (node.italic) text = `<em>${text}</em>`;
        if (node.underline) text = `<u>${text}</u>`;
        return text;
    }
    const children = node.children.map(n => serializeNode(n)).join('');
    switch (node.type) {
        case 'paragraph':
            return `<p>${children || '<br/>'}</p>`;
        case 'code-block':
            return `<pre><code>${children}</code></pre>`;
        case 'bulleted-list':
            return `<ul>${children}</ul>`;
        case 'numbered-list':
            return `<ol>${children}</ol>`;
        case 'list-item':
            return `<li>${children}</li>`;
        case 'link':
            return `<a href="${node.url}">${children}</a>`;
        case 'image':
            return `<p><img src="${node.url}"/></p>`;
        default:
            return children;
    }
}

// HTML deserializer to convert Quill-style HTML into Slate nodes
function deserializeHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const { body } = doc;
    return Array.from(body.childNodes).flatMap(deserializeElement);
}

function deserializeElement(el) {
    if (el.nodeType === Node.TEXT_NODE) {
        return [{ text: el.textContent }];
    }
    if (el.nodeName === 'BR') {
        return [{ text: '\n' }];
    }
    const children = Array.from(el.childNodes).flatMap(deserializeElement);
    switch (el.nodeName) {
        case 'P':
            return [{ type: 'paragraph', children: children.length ? children : [{ text: '' }] }];
        case 'PRE':
            const codeEl = el.querySelector('code');
            const text = codeEl ? codeEl.textContent : el.textContent;
            return [{ type: 'code-block', children: [{ text }] }];
        case 'UL':
            return [{ type: 'bulleted-list', children: children }];
        case 'OL':
            return [{ type: 'numbered-list', children: children }];
        case 'LI':
            return [{ type: 'list-item', children: children }];
        case 'A':
            return [{ type: 'link', url: el.getAttribute('href'), children: children }];
        case 'IMG':
            return [{ type: 'image', url: el.getAttribute('src'), children: [{ text: '' }] }];
        case 'STRONG':
            return children.map(n => ({ ...n, bold: true }));
        case 'EM':
            return children.map(n => ({ ...n, italic: true }));
        case 'U':
            return children.map(n => ({ ...n, underline: true }));
        default:
            return children;
    }
}

// 支持图片节点
const withImages = (editor) => {
    const { isVoid } = editor;
    editor.isVoid = element => element.type === 'image' ? true : isVoid(element);
    return editor;
};
// 插件：确保文档末尾不是 code-block，用户可在最后追加段落退出代码块
const withTrailingParagraph = editor => {
    const { normalizeNode } = editor;
    editor.normalizeNode = entry => {
        const [node, path] = entry;
        if (Editor.isEditor(node)) {
            const lastIndex = node.children.length - 1;
            const last = node.children[lastIndex];
            if (last.type === 'code-block') {
                Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] }, { at: [lastIndex + 1] });
                return;
            }
        }
        normalizeNode(entry);
    };
    return editor;
};

// 工具函数集：判断／切换 mark 和 block
const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const CustomEditor = {
    isMarkActive(editor, format) {
        const [match] = Editor.nodes(editor, {
            match: (n) => n[format] === true,
            universal: true,
        });
        return !!match;
    },
    toggleMark(editor, format) {
        const isActive = CustomEditor.isMarkActive(editor, format);
        Transforms.setNodes(
            editor,
            { [format]: isActive ? null : true },
            { match: (n) => Text.isText(n), split: true }
        );
    },
    isBlockActive(editor, format) {
        const [match] = Editor.nodes(editor, {
            match: (n) =>
                !Text.isText(n) && SlateElement.isElement(n) && n.type === format,
        });
        return !!match;
    },
    toggleBlock: function (editor, format) {
        const isActive = CustomEditor.isBlockActive(editor, format);
        const isList = LIST_TYPES.includes(format);
        // 支持 code-block
        if (format === 'code-block') {
            Transforms.setNodes(
                editor,
                { type: isActive ? 'paragraph' : 'code-block' },
                { match: n => SlateElement.isElement(n) && !Text.isText(n) }
            );
            if (!isActive) {
                // 变为 code-block，全部加 mark
                const [blockEntry] = Editor.nodes(editor, {
                    match: n => SlateElement.isElement(n) && n.type === 'code-block',
                });
                if (blockEntry) {
                    const [, path] = blockEntry;
                    for (const [node, nodePath] of Editor.nodes(editor, {
                        at: path,
                        match: n => Text.isText(n),
                    })) {
                        Transforms.setNodes(editor, { 'code-block': true }, { at: nodePath });
                    }
                }
            } else {
                // 变为普通段落，全部去 mark
                const [blockEntry] = Editor.nodes(editor, {
                    match: n => SlateElement.isElement(n) && n.type === 'paragraph',
                });
                if (blockEntry) {
                    const [, path] = blockEntry;
                    for (const [node, nodePath] of Editor.nodes(editor, {
                        at: path,
                        match: n => Text.isText(n),
                    })) {
                        Transforms.setNodes(editor, { 'code-block': null }, { at: nodePath });
                    }
                }
            }
            return;
        }
        const unwrapList = () => Transforms.unwrapNodes(editor, {
            match: n =>
                !Text.isText(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type),
            split: true,
        });
        unwrapList();
        Transforms.setNodes(
            editor,
            { type: isActive ? 'paragraph' : isList ? 'list-item' : format },
            { match: n => SlateElement.isElement(n) && !Text.isText(n) }
        );
        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block, {
                match: n =>
                    !Text.isText(n) && SlateElement.isElement(n) && n.type === 'list-item',
            });
        }
    },
    insertLink(editor, url) {
        if (editor.selection) {
            Transforms.insertNodes(
                editor,
                {
                    type: 'link',
                    url,
                    children: [{ text: url }],
                }
            );
        }
    },
};

// 代码块语言选项
const CODE_LANGUAGES = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'C', value: 'c' },
    { label: 'C++', value: 'cpp' },
    { label: 'Go', value: 'go' },
    { label: 'Java', value: 'java' },
    { label: 'HTML', value: 'markup' },
    // 可按需扩展更多语言
];

// 渲染块级元素
const Element = (props) => {
    const { attributes, children, element } = props;
    const editor = useSlate();
    switch (element.type) {
        case 'code-block': {
            const language = element.language || 'javascript';
            const onLangChange = e => {
                const path = ReactEditor.findPath(editor, element);
                Transforms.setNodes(editor, { language: e.target.value }, { at: path });
            };
            return (
                <pre
                    {...attributes}
                    className={`code-block language-${language}`}
                    style={{
                        position: 'relative',
                        margin: '8px 0',
                        overflowX: 'auto',
                        fontFamily: 'monospace',
                    }}
                >
                    {element.type === 'code-block' && (
                        <select
                            value={language}
                            onChange={onLangChange}
                            contentEditable={false}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: 8,
                                zIndex: 2,
                                fontSize: 12,
                                background: '#fff',
                                border: '1px solid #eee',
                                borderRadius: 4,
                            }}
                        >
                            {CODE_LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    )}
                    <code className={`language-${language}`} style={{ display: 'block', whiteSpace: 'pre-wrap' }}>
                        {children}
                    </code>
                </pre>
            );
        }
        case 'image':
            return (
                <div {...attributes} contentEditable={false} style={{ margin: '12px 0' }}>
                    <img src={element.url} alt="" style={{ maxWidth: '100%' }} />
                    {children}
                </div>
            );
        case 'block-quote':
            return <blockquote {...attributes} style={{ borderLeft: '2px solid #ddd', margin: '8px 0', paddingLeft: 10 }}>{children}</blockquote>;
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>;
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>;
        case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>;
        case 'numbered-list':
            return <ol {...attributes}>{children}</ol>;
        case 'list-item':
            return <li {...attributes}>{children}</li>;
        case 'link':
            return <a {...attributes} href={element.url}>{children}</a>;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

// 图片按钮
const ImageButton = () => {
    const editor = useSlate();
    const insertImage = (url) => {
        const image = { type: 'image', url, children: [{ text: '' }] };
        Transforms.insertNodes(editor, image);
    };
    const onChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const res = await uploadFileAPI(formData);
        insertImage(res.data.data);
        // 插入一个空段落，确保光标跳到图片下方
        Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
    };
    return (
        <>
            <input id="slate-image-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
            <label htmlFor="slate-image-upload" style={{ cursor: 'pointer', margin: '0 8px' }}>
                <FaImage />
            </label>
        </>
    );
};

// 工具栏按钮
const MarkButton = ({ format, icon }) => {
    const editor = useSlate();
    const isActive = CustomEditor.isMarkActive(editor, format);
    return (
        <button
            type="button"
            onMouseDown={e => {
                e.preventDefault();
                CustomEditor.toggleMark(editor, format);
            }}
            style={{ cursor: 'pointer', background: isActive ? '#e6f7ff' : 'none', border: 'none', margin: '0 4px', color: isActive ? '#1890ff' : undefined }}
        >
            {icon}
        </button>
    );
};

const BlockButton = ({ format, icon }) => {
    const editor = useSlate();
    const isActive = CustomEditor.isBlockActive(editor, format);
    return (
        <button
            type="button"
            onMouseDown={e => {
                e.preventDefault();
                CustomEditor.toggleBlock(editor, format);
            }}
            style={{ cursor: 'pointer', background: isActive ? '#e6f7ff' : 'none', border: 'none', margin: '0 4px', color: isActive ? '#1890ff' : undefined }}
        >
            {icon}
        </button>
    );
};

const Toolbar = () => {
    const editor = useSlate();
    return (
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '8px', background: '#fafbfc' }}>
            <MarkButton format="bold" icon={<FaBold />} />
            <MarkButton format="italic" icon={<FaItalic />} />
            <MarkButton format="underline" icon={<FaUnderline />} />
            <BlockButton format="heading-one" icon={<FaHeading />} />
            <BlockButton format="heading-two" icon={<FaHeading style={{ fontSize: '0.8em' }} />} />
            <BlockButton format="bulleted-list" icon={<FaListUl />} />
            <BlockButton format="numbered-list" icon={<FaListOl />} />
            <BlockButton format="block-quote" icon={<FaQuoteRight />} />
            <BlockButton format="code-block" icon={<FaCode style={{ fontSize: '1.2em', color: '#222' }} />} />
            <ImageButton />
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.undo && editor.undo(); }} style={{ margin: '0 4px', background: 'none', border: 'none', cursor: 'pointer' }}><FaUndo /></button>
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.redo && editor.redo(); }} style={{ margin: '0 4px', background: 'none', border: 'none', cursor: 'pointer' }}><FaRedo /></button>
            <button
                type="button"
                onMouseDown={e => {
                    e.preventDefault();
                    const url = window.prompt('请输入链接 URL');
                    if (url) {
                        CustomEditor.insertLink(editor, url);
                    }
                }}
                style={{ cursor: 'pointer', background: 'none', border: 'none', margin: '0 4px' }}
            >
                <FaLink />
            </button>
        </div>
    );
};

const initialValue = [
    {
        type: 'paragraph',
        children: [{ text: '这是一个 Slate 编辑器，支持更多格式、代码高亮和图片上传。' }],
    },
    {
        type: 'code-block',
        children: [{ text: 'function hello(name) {\n  console.log("Hello, " + name);\n}\nhello("World");' }],
    },
];

// 计算 token 实际字符长度，支持嵌套 Token
function getTokenLength(token) {
    if (typeof token === 'string') {
        return token.length;
    }
    if (Array.isArray(token.content)) {
        return token.content.reduce((sum, t) => sum + getTokenLength(t), 0);
    }
    return token.content.length;
}

// Prism decorate 实现（使用递归长度计算）
function decorate([node, path]) {
    const ranges = [];
    if (node.type === 'code-block' && Array.isArray(node.children)) {
        const language = node.language || 'javascript';
        node.children.forEach((child, index) => {
            let offset = 0;
            const tokens = Prism.tokenize(child.text, Prism.languages[language] || Prism.languages.javascript);
            tokens.forEach(token => {
                const len = getTokenLength(token);
                if (typeof token !== 'string') {
                    ranges.push({
                        anchor: { path: path.concat([index]), offset },
                        focus: { path: path.concat([index]), offset: offset + len },
                        tokenType: token.type,
                        alias: token.alias,
                    });
                }
                offset += len;
            });
        });
    }
    return ranges;
}

// Leaf 组件定义
const Leaf = (props) => {
    const { attributes, leaf, children } = props;
    let el = children;
    if (leaf.bold) el = <strong>{el}</strong>;
    if (leaf.italic) el = <em>{el}</em>;
    if (leaf.underline) el = <u>{el}</u>;
    // Prism tokenType + alias 高亮
    const classes = [];
    if (leaf.tokenType) classes.push(leaf.tokenType);
    if (leaf.alias) {
        if (Array.isArray(leaf.alias)) {
            classes.push(...leaf.alias);
        } else if (typeof leaf.alias === 'string') {
            classes.push(leaf.alias);
        }
    }
    return <span {...attributes} className={classes.length ? `token ${classes.join(' ')}` : undefined}>{el}</span>;
};

// 辅助：将 dataURL 转 File
const base64ToFile = (dataUrl, filename = 'image.png') => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
};

const SlateEditorWithHighlightAndImage = ({ value, onChange }) => {
    // 动态加载 Prism 主题以匹配系统深/浅模式
    React.useEffect(() => {
        if (window.matchMedia) {
            const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            import(`prismjs/themes/${dark ? 'prism-tomorrow' : 'prism'}.css`);
        }
    }, []);
    // assume `value` prop is a valid Node[] array for Slate
    const slateNodes = useMemo(() => Array.isArray(value) ? value : [{ type: 'paragraph', children: [{ text: '' }] }], [value]);
    const editor = useMemo(
        () => withTrailingParagraph(withImages(withHistory(withReact(createEditor())))),
        []
    );


    // define rendering callbacks and image handler inside component
    const renderElement = useCallback(props => <Element {...props} />, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
    const handleImageUpload = useCallback(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const localUrl = reader.result;
            // 插入预览
            Transforms.insertNodes(editor, { type: 'image', url: localUrl, uploading: true, children: [{ text: '' }] });
            // 插入一个空段落，以确保光标可以移到图片后面
            Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
            // 真正上传
            const formData = new FormData();
            formData.append('image', file);
            uploadFileAPI(formData).then(res => {
                const realUrl = res.data.data;
                // 全局替换 uploading 节点
                Transforms.setNodes(
                    editor,
                    { url: realUrl, uploading: false },
                    { match: n => n.type === 'image' && n.uploading === true }
                );
            });
        };
    }, [editor]);

    return (
        <div style={{ marginTop: 0 }}>
            <Slate
                editor={editor}
                initialValue={slateNodes}
                onChange={newNodes => onChange && onChange(newNodes)}
            >
                <Toolbar />
                <Editable
                    style={{ width: '100%', minHeight: 120, border: '1px solid #e1e4e8', borderRadius: '0 0 8px 8px', padding: '10px 10px 10px 10px' }}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    decorate={decorate}
                    // placeholder="请输入内容，可插入图片、代码块及更多格式..."
                    spellCheck
                    autoFocus
                    onKeyDown={event => {
                        const { selection } = editor;
                        if (event.key === 'Enter' && selection) {
                            // 检查当前是否在 code-block
                            const [match] = Editor.nodes(editor, {
                                match: n =>
                                    !Text.isText(n) &&
                                    SlateElement.isElement(n) &&
                                    n.type === 'code-block',
                            });
                            if (match) {
                                event.preventDefault();
                                Transforms.insertText(editor, '\n');
                                return;
                            }
                        }
                        if (event.key === '`' && event.ctrlKey) {
                            event.preventDefault();
                            CustomEditor.toggleBlock(editor, 'code-block');
                        }
                    }}
                    // 拖拽图片
                    onDrop={event => {
                        const [file] = Array.from(event.dataTransfer.files || []);
                        if (file && file.type.startsWith('image/')) {
                            event.preventDefault();
                            handleImageUpload(file);
                        }
                    }}
                    // 粘贴图片
                    onPaste={event => {
                        const [file] = Array.from(event.clipboardData.files || []);
                        if (file && file.type.startsWith('image/')) {
                            event.preventDefault();
                            handleImageUpload(file);
                        }
                    }}
                />
            </Slate>
        </div>
    );
};

export { serializeNode, deserializeHTML };
export default SlateEditorWithHighlightAndImage;
