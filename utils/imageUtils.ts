export const resizeImage = (file: File, maxWidth: number = 512, maxHeight: number = 512): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(event.target?.result as string); // fallback
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                // Compress heavily to keep standard saves small
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            if (event.target?.result) {
                img.src = event.target.result as string;
            } else {
                reject(new Error("Failed to read file"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
