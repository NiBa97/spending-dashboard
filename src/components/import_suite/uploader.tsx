import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
export const UploadComponent = ({
  onNext,
}: {
  onNext: (data: Record<string, string>[]) => void;
}) => {
  const onDrop = (acceptedFiles: File[]) => {
    Papa.parse(acceptedFiles[0]!, {
      header: true,
      complete: function (results: Papa.ParseResult<object>) {
        onNext(results.data as Record<string, string>[]); // get the first 5 rows
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed ${
        isDragActive ? "border-blue-500" : "border-gray-500"
      } flex cursor-pointer items-center justify-center p-4`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
};
