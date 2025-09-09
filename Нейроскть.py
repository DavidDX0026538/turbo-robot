import numpy as np
import tensorflow as tf
import tensorflow_datasets as tfds
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout
from tensorflow.keras.utils import to_categorical
import tkinter as tk
from PIL import Image, ImageDraw, ImageOps
from tkinter import messagebox
import string

class DigitRecognizer:
    def __init__(self):
        (self.x_train, self.y_train), (self.x_test, self.y_test) = self.load_emnist()
        self.x_train = self.x_train / 255.0
        self.x_test = self.x_test / 255.0
        self.y_train = to_categorical(self.y_train, 62)
        self.y_test = to_categorical(self.y_test, 62)
        self.model = self._build_model()
        
    def load_emnist(self):
        ds = tfds.load('emnist/byclass', split=['train', 'test'], as_supervised=True)
        train_ds, test_ds = ds
        x_train, y_train = [], []
        for image, label in tfds.as_numpy(train_ds):
            image = np.rot90(image, k=3, axes=(0,1))
            image = np.fliplr(image)
            x_train.append(image)
            y_train.append(label)
        x_train = np.array(x_train)
        y_train = np.array(y_train)
        x_test, y_test = [], []
        for image, label in tfds.as_numpy(test_ds):
            image = np.rot90(image, k=3, axes=(0,1))
            image = np.fliplr(image)
            x_test.append(image)
            y_test.append(label)
        x_test = np.array(x_test)
        y_test = np.array(y_test)
        return (x_train, y_train), (x_test, y_test)
    
    def _build_model(self):
        model = Sequential([
            Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(28, 28, 1)),
            MaxPooling2D(pool_size=(2, 2)),
            Conv2D(64, kernel_size=(3, 3), activation='relu'),
            MaxPooling2D(pool_size=(2, 2)),
            Dropout(0.25),
            Flatten(),
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(62, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model
    
    def train(self, epochs=5, batch_size=128):
        history = self.model.fit(
            self.x_train, self.y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_data=(self.x_test, self.y_test)
        )
        test_loss, test_acc = self.model.evaluate(self.x_test, self.y_test)
        print(f'Точность на тестовых данных: {test_acc:.4f}')
        return history
    
    def save_model(self, filename='emnist_model.h5'):
        self.model.save(filename)
        print(f'Модель сохранена как {filename}')
    
    def load_model(self, filename='emnist_model.h5'):
        self.model = tf.keras.models.load_model(filename)
        print(f'Модель загружена из {filename}')
    
    def predict(self, image_array):
        img = Image.fromarray(image_array).resize((28, 28), Image.Resampling.LANCZOS)
        img_array = np.array(img) / 255.0
        input_image = img_array.reshape(1, 28, 28, 1)
        prediction = self.model.predict(input_image)
        predicted_class = np.argmax(prediction)
        confidence = prediction[0][predicted_class]
        class_labels = list(string.digits + string.ascii_uppercase + string.ascii_lowercase)
        character = class_labels[predicted_class]
        return character, confidence

class DrawingApp:
    def __init__(self, root, recognizer):
        self.root = root
        self.root.title("Распознавание рукописных символов")
        self.recognizer = recognizer
        self.canvas_width = 400
        self.canvas_height = 400
        self.old_x = None
        self.old_y = None
        self.line_width = 15
        self.color = "black"
        self.image = Image.new("L", (self.canvas_width, self.canvas_height), color=0)
        self.image_draw = ImageDraw.Draw(self.image)
        self.setup_ui()
        
    def setup_ui(self):
        main_frame = tk.Frame(self.root, padx=10, pady=10)
        main_frame.pack(expand=True, fill=tk.BOTH)
        self.canvas = tk.Canvas(
            main_frame, 
            bg="white", 
            width=self.canvas_width, 
            height=self.canvas_height, 
            bd=2, 
            relief=tk.SUNKEN
        )
        self.canvas.grid(row=0, column=0, columnspan=3, padx=5, pady=5)
        self.canvas.bind("<Button-1>", self.start_draw)
        self.canvas.bind("<B1-Motion>", self.draw)
        self.canvas.bind("<ButtonRelease-1>", self.end_draw)
        clear_btn = tk.Button(main_frame, text="Очистить", command=self.clear_canvas)
        clear_btn.grid(row=1, column=0, padx=5, pady=5)
        recognize_btn = tk.Button(main_frame, text="Распознать", command=self.recognize_character)
        recognize_btn.grid(row=1, column=1, padx=5, pady=5)
        quit_btn = tk.Button(main_frame, text="Выход", command=self.root.quit)
        quit_btn.grid(row=1, column=2, padx=5, pady=5)
        result_frame = tk.Frame(main_frame)
        result_frame.grid(row=2, column=0, columnspan=3, padx=5, pady=5)
        tk.Label(result_frame, text="Распознанный символ:").pack(side=tk.LEFT)
        self.result_label = tk.Label(result_frame, text="", font=("Arial", 24, "bold"))
        self.result_label.pack(side=tk.LEFT, padx=10)
        tk.Label(result_frame, text="Уверенность:").pack(side=tk.LEFT, padx=(20, 0))
        self.confidence_label = tk.Label(result_frame, text="", font=("Arial", 16))
        self.confidence_label.pack(side=tk.LEFT, padx=10)
        
    def start_draw(self, event):
        self.old_x = event.x
        self.old_y = event.y
    
    def draw(self, event):
        if self.old_x and self.old_y:
            x1, y1 = (self.old_x - self.line_width), (self.old_y - self.line_width)
            x2, y2 = (event.x + self.line_width), (event.y + self.line_width)
            self.canvas.create_oval(x1, y1, x2, y2, fill=self.color, width=0)
            self.image_draw.line(
                [(self.old_x, self.old_y), (event.x, event.y)], 
                fill=255, 
                width=self.line_width * 2
            )
        self.old_x = event.x
        self.old_y = event.y
    
    def end_draw(self, event):
        self.old_x = None
        self.old_y = None
    
    def clear_canvas(self):
        self.canvas.delete("all")
        self.image = Image.new("L", (self.canvas_width, self.canvas_height), color=0)
        self.image_draw = ImageDraw.Draw(self.image)
        self.result_label.config(text="")
        self.confidence_label.config(text="")
    
    def recognize_character(self):
        img_array = np.array(self.image)
        predicted_character, confidence = self.recognizer.predict(img_array)
        self.result_label.config(text=predicted_character)
        self.confidence_label.config(text=f"{confidence:.2%}")

def show_training_progress(root, recognizer, epochs=5):
    progress_window = tk.Toplevel(root)
    progress_window.title("Обучение модели")
    progress_window.geometry("400x150")
    progress_window.resizable(False, False)
    window_width = 400
    window_height = 150
    screen_width = progress_window.winfo_screenwidth()
    screen_height = progress_window.winfo_screenheight()
    x = (screen_width - window_width) // 2
    y = (screen_height - window_height) // 2
    progress_window.geometry(f"{window_width}x{window_height}+{x}+{y}")
    status_label = tk.Label(progress_window, text="Подготовка данных...", font=("Arial", 12))
    status_label.pack(pady=(20, 10))
    progress_label = tk.Label(progress_window, text="Общий прогресс:")
    progress_label.pack(anchor="w", padx=20)
    progress_bar = tk.Canvas(progress_window, width=360, height=20, bg="white", bd=1, relief=tk.SUNKEN)
    progress_bar.pack(padx=20, pady=5)
    epoch_var = tk.StringVar(value="Эпоха: 0/" + str(epochs))
    epoch_label = tk.Label(progress_window, textvariable=epoch_var)
    epoch_label.pack(pady=5)
    progress_fill = progress_bar.create_rectangle(2, 2, 2, 19, fill="blue")
    progress_window.update()
    
    class ProgressCallback(tf.keras.callbacks.Callback):
        def on_epoch_begin(self, epoch, logs=None):
            epoch_var.set(f"Эпоха: {epoch+1}/{epochs}")
            status_label.config(text=f"Обучение... Эпоха {epoch+1} из {epochs}")
            progress_window.update()
        
        def on_epoch_end(self, epoch, logs=None):
            progress = (epoch + 1) / epochs
            width = int(360 * progress)
            progress_bar.coords(progress_fill, 2, 2, width, 19)
            acc = logs.get('accuracy', 0)
            val_acc = logs.get('val_accuracy', 0)
            status_label.config(text=f"Точность: {acc:.4f}, Валидационная точность: {val_acc:.4f}")
            progress_window.update()
        
        def on_train_end(self, logs=None):
            status_label.config(text="Обучение завершено!")
            progress_window.update()
            progress_window.after(1000, progress_window.destroy)
    
    progress_callback = ProgressCallback()
    history = recognizer.model.fit(
        recognizer.x_train, recognizer.y_train,
        batch_size=128,
        epochs=epochs,
        validation_data=(recognizer.x_test, recognizer.y_test),
        callbacks=[progress_callback]
    )
    test_loss, test_acc = recognizer.model.evaluate(recognizer.x_test, recognizer.y_test)
    print(f'Точность на тестовых данных: {test_acc:.4f}')
    messagebox.showinfo("Обучение завершено", f"Точность на тестовых данных: {test_acc:.4f}")
    recognizer.save_model()
    return history

def main():
    root = tk.Tk()
    root.withdraw()
    print("Инициализация распознавателя...")
    recognizer = DigitRecognizer()
    try:
        recognizer.load_model()
        print("Модель успешно загружена!")
        test_loss, test_acc = recognizer.model.evaluate(recognizer.x_test, recognizer.y_test)
        messagebox.showinfo("Модель загружена", f"Точность на тестовых данных: {test_acc:.4f}")
    except Exception as e:
        print(f"Не удалось загрузить модель: {e}")
        print("Обучение новой модели...")
        show_training_progress(root, recognizer, epochs=5)
    root.deiconify()
    root.title("Распознавание рукописных символов")
    app = DrawingApp(root, recognizer)
    root.mainloop()

if __name__ == "__main__":

    main()
