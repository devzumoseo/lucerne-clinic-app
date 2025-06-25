import {FC} from 'react';
import css from './pdf-editor.module.scss';
const PdfEditor: FC<{file: Blob}> = ({file}) => {
    return (
        <div className={css.wrap}>
            <iframe
                id='my_iframe'
                title="PDF"
                src={`/libs/pdfjs-dist/web/viewer.html?file=${URL.createObjectURL(file)}#zoom=60`}
                width="100%"
                height="100%"
            ></iframe>
        </div>
    );
};

export default PdfEditor;
