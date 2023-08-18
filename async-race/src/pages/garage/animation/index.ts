export class MyAnimation {
    private animationId = 0;
    public animate(element: HTMLElement, duration: number) {
        let start: number | null = null;

        const step = (timestamp: number) => {
            if (!start) {
                start = timestamp;
            }
            const progress = timestamp - start;
            const translation = (document.documentElement.clientWidth - 160) * this.Linear(progress / duration);
            element.style.left = 55 + translation + 'px';
            if (progress < duration) {
                this.animationId = window.requestAnimationFrame(step);
            } else {
                this.animationId = 0;
            }
        };
        this.animationId = window.requestAnimationFrame(step);
    }
    public stopAnimation() {
        window.cancelAnimationFrame(this.animationId);
        this.animationId = 0;
    }
    private Linear(time: number) {
        return time;
    }
    public getAnimationId() {
        return this.animationId;
    }
}
