import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  createEditor,
  EditorState,
  LexicalEditor,
  EditorConfig,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  TextFormatType,
  $isRangeSelection,
  RangeSelection,
} from 'lexical';


import { BlogPost } from '../services/blog.service';

@Component({
  selector: 'app-blog-editor',
  template: `
    <div class="editor-container">
      <div class="toolbar">
        <button (click)="toggleBold()">Bold</button>
        <button (click)="toggleItalic()">Italic</button>
      </div>
      <div #editorContainer class="editor-content"></div>
      <button (click)="savePost()">Save Post</button>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
})
export class BlogEditorComponent implements OnInit {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @Output() save = new EventEmitter<BlogPost>();

  private editor: LexicalEditor | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.initEditor();
    }
  }

  private initEditor() {
    const config: EditorConfig = {
      namespace: 'BlogEditor',
      theme: {
        paragraph: 'editor-paragraph',
        text: {
          bold: 'editor-text-bold',
          italic: 'editor-text-italic',
          underline: 'editor-text-underline',
        },
      },
    };

    this.editor = createEditor(config);
    this.editor.setRootElement(this.editorContainer.nativeElement);

    // Initialize with empty content
    this.editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(''));
      root.append(paragraph);
    });
  }

  private formatSelection(formatType: TextFormatType) {
    if (this.isBrowser && this.editor) {
      this.editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          (selection as RangeSelection).formatText(formatType);
        }
      });
    }
  }

  toggleBold() {
    this.formatSelection('bold');
  }

  toggleItalic() {
    this.formatSelection('italic');
  }

  savePost() {
    if (!this.isBrowser || !this.editor) {
      return;
    }

    const editorState = this.editor.getEditorState();
    const jsonString = JSON.stringify(editorState);

    const post: BlogPost = {
      title: 'New Post',
      content: jsonString,
      editorState: editorState,
      published: false,
    };

    this.save.emit(post);
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.setRootElement(null);
      this.editor = null;
    }
  }
}
