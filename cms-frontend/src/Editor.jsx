import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

function Editor({
  content,
  onChange
}) {

  const token =
    localStorage.getItem("token");

  // =========================
  // SUBIR IMAGEN INLINE
  // =========================

  async function subirImagen() {

    try {

      const input =
        document.createElement("input");

      input.type = "file";

      input.accept = "image/*";

      input.click();

      input.onchange = async () => {

        const archivo =
          input.files[0];

        if (!archivo) {
          return;
        }

        const formData =
          new FormData();

        formData.append(
          "imagen",
          archivo
        );

        const response = await fetch(
          "http://127.0.0.1:8787/upload",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`
            },
            body: formData
          }
        );

        const data =
          await response.json();

        console.log(data);

        if (data.success) {

          editor
            .chain()
            .focus()
            .setImage({
              src: data.url
            })
            .run();
        }
      };

    } catch (error) {

      console.log(error);
    }
  }

  const editor = useEditor({

    extensions: [
      StarterKit,
      Image
    ],

    content,

    onUpdate: ({ editor }) => {

      onChange(
        editor.getHTML()
      );
    }
  });

  if (!editor) {
    return null;
  }

  return (
    <div>

      {/* TOOLBAR */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap"
        }}
      >

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
        >
          Bold
        </button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
        >
          Italic
        </button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1
              })
              .run()
          }
        >
          H1
        </button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2
              })
              .run()
          }
        >
          H2
        </button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          Lista
        </button>

        <button
          onClick={subirImagen}
        >
          Imagen
        </button>

      </div>

      {/* EDITOR */}

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "15px",
          minHeight: "200px"
        }}
      >

        <EditorContent
          editor={editor}
        />

      </div>

    </div>
  );
}

export default Editor;