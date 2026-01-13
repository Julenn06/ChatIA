/**
 * Performance Utilities - Optimizaciones de rendimiento
 */

export class PerformanceUtils {
    /**
     * Debounce - Retrasa la ejecución hasta que pase un tiempo sin llamadas
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle - Limita la frecuencia de ejecución
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * RequestAnimationFrame wrapper para operaciones del DOM
     */
    static rafThrottle(func) {
        let rafId = null;
        return function(...args) {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    func.apply(this, args);
                    rafId = null;
                });
            }
        };
    }

    /**
     * Batch DOM operations para reducir reflows
     */
    static batchDOMUpdates(operations) {
        requestAnimationFrame(() => {
            operations.forEach(op => op());
        });
    }
}

/**
 * Caché simple para resultados de renderizado
 */
export class RenderCache {
    constructor(maxSize = 50) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Eliminar el primer elemento (más antiguo)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    has(key) {
        return this.cache.has(key);
    }

    clear() {
        this.cache.clear();
    }
}
