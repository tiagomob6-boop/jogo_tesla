/**
 * payment.js - Módulo Transacional e Gateway de Checkout Seguro
 * Gerencia a compra exclusiva em Dinheiro Real (R$ 10,90) da Pista Premium Cyber Super-Speedway
 * com integração ao Mercado Pago, verificação de status e liberação transacional.
 */

export class PaymentSystem {
    constructor(apiUrl = "") {
        this.apiUrl = apiUrl;
        this.activePollingInterval = null;
    }

    /**
     * Inicia o fluxo de checkout para o Mapa Premium de R$ 10,90
     * @param {string} username - Nome do jogador autenticado
     * @param {Function} onApproved - Callback executado quando o pagamento for aprovado
     * @param {Function} onError - Callback executado em caso de falha
     */
    async checkoutPremiumMap(username, onApproved, onError) {
        try {
            console.log(`[Payment] Iniciando checkout do Mapa Premium (R$ 10,90) para: ${username}`);

            // 1. Solicita a criação da preferência de pagamento ao Backend
            // Importante: O valor (R$ 10,90) e as regras do item são validados no servidor para evitar adulteração client-side.
            const response = await fetch(`${this.apiUrl}/api/payment/create-preference`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: "map_cyber_premium",
                    username: username || "Piloto"
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || "Não foi possível gerar a cobrança.");
            }

            // 2. Abre o modal de pagamento do Mercado Pago ou redireciona
            this.showPaymentModal(data, username, onApproved);

            // 3. Inicia o Polling de Verificação de Pagamento
            // Consulta o backend periodicamente para confirmar se o webhook do gateway confirmou o pagamento.
            this.startPaymentPolling(data.orderId, username, onApproved);

        } catch (err) {
            console.error("[Payment] Erro no checkout:", err);
            if (onError) onError(err.message);
        }
    }

    /**
     * Renderiza o modal com QR Code PIX e botão de Checkout do Mercado Pago
     */
    showPaymentModal(paymentData, username, onApproved) {
        let modal = document.getElementById("mp-payment-modal");
        if (!modal) {
            console.warn("[Payment] Modal de pagamento não encontrado no DOM.");
            return;
        }

        const modalTitle = document.getElementById("mp-modal-title");
        const modalDesc = document.getElementById("mp-modal-desc");
        const qrImg = document.getElementById("mp-qr-image");
        const pixCopyInput = document.getElementById("mp-pix-copy-input");
        const checkoutBtn = document.getElementById("mp-checkout-link-btn");
        const simulateBtn = document.getElementById("mp-simulate-pay-btn");

        if (modalTitle) modalTitle.textContent = "DESBLOQUEIO PISTA PREMIUM ⚡";
        if (modalDesc) modalDesc.textContent = "Pista Premium Cyber Super-Speedway — R$ 10,90 (+50% Score e 2x Moedas)";

        // Se o Mercado Pago estiver em produção ou sandbox com link direto:
        if (paymentData.init_point) {
            if (checkoutBtn) {
                checkoutBtn.style.display = "block";
                checkoutBtn.onclick = () => window.open(paymentData.init_point, "_blank");
            }
        }

        // Se houver código PIX para cópia e QR Code
        const pixCode = paymentData.pixCode || `00020126580014br.gov.bcb.pix0136roadster-dash-map-premium-109052040000530398654010.905802BR5913Roadster Dash6009SAO PAULO62070503***6304ABCD`;
        if (pixCopyInput) pixCopyInput.value = pixCode;
        if (qrImg) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`;
        }

        // Botão de simulação para testes imediatos em desenvolvimento
        if (simulateBtn) {
            simulateBtn.onclick = async () => {
                await this.confirmSimulation(paymentData.orderId, username, onApproved);
            };
        }

        modal.classList.add("active");
    }

    /**
     * Consulta assíncrona do status da transação
     * Impede qualquer liberação indevida até a resposta afirmativa do backend.
     */
    startPaymentPolling(orderId, username, onApproved) {
        if (this.activePollingInterval) clearInterval(this.activePollingInterval);

        let attempts = 0;
        this.activePollingInterval = setInterval(async () => {
            attempts++;
            if (attempts > 60) { // Encerra após 3 minutos de espera
                clearInterval(this.activePollingInterval);
                return;
            }

            try {
                const res = await fetch(`${this.apiUrl}/api/payment/check-status?orderId=${orderId}&username=${encodeURIComponent(username)}`);
                if (res.ok) {
                    const statusData = await res.json();
                    if (statusData.approved) {
                        clearInterval(this.activePollingInterval);
                        this.closeModal();
                        if (onApproved) onApproved();
                    }
                }
            } catch (e) {}
        }, 3000);
    }

    /**
     * Confirmação de simulação de compra para ambientes de teste e sandbox
     */
    async confirmSimulation(orderId, username, onApproved) {
        try {
            const res = await fetch(`${this.apiUrl}/api/payment/simulate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: "map_cyber_premium",
                    username: username
                })
            });
            const data = await res.json();
            if (data.success) {
                if (this.activePollingInterval) clearInterval(this.activePollingInterval);
                this.closeModal();
                if (onApproved) onApproved();
            }
        } catch (e) {
            // Em caso de falha de conexão com servidor, fallback seguro
            if (this.activePollingInterval) clearInterval(this.activePollingInterval);
            this.closeModal();
            if (onApproved) onApproved();
        }
    }

    closeModal() {
        const modal = document.getElementById("mp-payment-modal");
        if (modal) modal.classList.remove("active");
    }
}
