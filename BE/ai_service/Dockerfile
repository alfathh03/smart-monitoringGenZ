FROM python:3.10-slim

# Install dependency sistem untuk OpenCV & AI
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=user . /app

CMD ["gunicorn", "-b", "0.0.0.0:7860", "--timeout", "120", "app:app"]