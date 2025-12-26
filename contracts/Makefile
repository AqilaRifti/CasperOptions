# CasperOptions Contract Build System
# ====================================

.PHONY: prepare build clean test all help

# Default target
all: build

# Help target
help:
	@echo "CasperOptions Contract Build System"
	@echo "===================================="
	@echo ""
	@echo "Available targets:"
	@echo "  make prepare  - Install wasm32 target and dependencies"
	@echo "  make build    - Build the contract in release mode"
	@echo "  make clean    - Remove build artifacts"
	@echo "  make test     - Run contract tests"
	@echo "  make all      - Build everything (default)"
	@echo ""
	@echo "After building, the WASM file will be at:"
	@echo "  option-registry/target/wasm32-unknown-unknown/release/option-registry.wasm"

# Install wasm32 target
prepare:
	@echo "Installing wasm32-unknown-unknown target..."
	rustup target add wasm32-unknown-unknown
	@echo "Done! Ready to build."

# Build the contract
build:
	@echo "Building option-registry contract..."
	cd option-registry && cargo build --release --target wasm32-unknown-unknown
	@echo ""
	@echo "Build complete! WASM file:"
	@ls -lh option-registry/target/wasm32-unknown-unknown/release/option-registry.wasm
	@echo ""
	@echo "Ready for deployment. Run: ./deploy.sh"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	cd option-registry && cargo clean
	@echo "Clean complete."

# Run tests (requires test crate setup)
test:
	@echo "Running contract tests..."
	cd option-registry && cargo test
	@echo "Tests complete."

# Optimize WASM (optional - requires wasm-opt)
optimize:
	@echo "Optimizing WASM file..."
	@if command -v wasm-opt > /dev/null; then \
		wasm-opt -Oz -o option-registry/target/wasm32-unknown-unknown/release/option-registry-optimized.wasm \
			option-registry/target/wasm32-unknown-unknown/release/option-registry.wasm; \
		echo "Optimized WASM:"; \
		ls -lh option-registry/target/wasm32-unknown-unknown/release/option-registry-optimized.wasm; \
	else \
		echo "wasm-opt not found. Install with: brew install binaryen"; \
	fi
