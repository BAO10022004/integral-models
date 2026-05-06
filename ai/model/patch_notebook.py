"""
patch_notebook.py
-----------------
Chạy script này một lần để cập nhật extract_features.ipynb
  python ai/model/patch_notebook.py
"""
import json
import pathlib

NB = pathlib.Path(__file__).parent / "extract_features.ipynb"

nb = json.loads(NB.read_text(encoding="utf-8"))

for cell in nb["cells"]:
    cid = cell.get("id", "")

    # ── 1. cell_imports: thêm import feature_extractor ──────────────────────
    if cid == "cell_imports":
        src = cell["source"]
        new_import = "from ai.model.feature_extractor import extract_features\n"
        if not any("feature_extractor" in s for s in src):
            idx = next((i for i, s in enumerate(src) if "print(" in s), len(src))
            src.insert(idx, new_import)
            cell["source"] = src
            print("✅ Patched cell_imports")

    # ── 2. cell_helper_funcs: giữ nguyên (helper vẫn hữu ích để tham khảo) ──

    # ── 3. cell_extract_features: thay bằng smoke-test ngắn ─────────────────
    if cid == "cell_extract_features":
        cell["source"] = [
            "# ─── extract_features đã được chuyển sang feature_extractor.py ─────────────\n",
            "# Xem: ai/model/feature_extractor.py\n",
            "#\n",
            "# Ba nhóm features tối ưu mới:\n",
            "#   NHÓM 1 – detect_root_add_sub()      → phát hiện root ADD/SUB (action 8)\n",
            "#   NHÓM 2 – detect_const_times_func()  → phát hiện c*f(x)\n",
            "#   NHÓM 3 – detect_basic_antiderivative() → nguyên hàm cơ bản 1 bước (action -1)\n",
            "\n",
            "# ── Smoke test ──────────────────────────────────────────────────────────────\n",
            "test_cases = [\n",
            "    (r'\\int_{0}^{1}x+\\sin{x}dx',        'action 8 – root ADD'),\n",
            "    (r'\\int_{0}^{1}2*\\sin{x}dx',         'action -1 – const*trig'),\n",
            "    (r'\\int_{0}^{1}{x}^{3}dx',            'action -1 – mono'),\n",
            "    (r'\\int_{0}^{1}\\cos{2*x}dx',          'action 3 – trig nontrivial'),\n",
            "    (r'\\int_{0}^{1}{x+1}^{2}dx',          'action 2 – expand'),\n",
            "]\n",
            "\n",
            "print('\\n=== Smoke Tests ===')\n",
            "for latex, desc in test_cases:\n",
            "    f = extract_features(latex)\n",
            "    if f is None:\n",
            "        print(f'  [{desc}] PARSE ERROR')\n",
            "        continue\n",
            "    key_flags = {\n",
            "        'root_is_add_or_sub' : f.get('root_is_add_or_sub', 0),\n",
            "        'root_const_times_func': f.get('root_const_times_func', 0),\n",
            "        'one_step_basic'       : f.get('one_step_basic', 0),\n",
            "        'mono_with_add_inner'  : f.get('mono_with_add_inner', 0),\n",
            "        'trig_nontrivial_inner': f.get('trig_nontrivial_inner', 0),\n",
            "    }\n",
            "    print(f'  [{desc}]')\n",
            "    for k, v in key_flags.items():\n",
            "        print(f'    {k}: {v}')\n",
            "print(f'\\nTotal features per sample: {len(f)}')\n",
        ]
        cell["outputs"] = []
        cell["execution_count"] = None
        print("✅ Patched cell_extract_features")

NB.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"\n💾 Saved: {NB}")
