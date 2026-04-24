"""Wikitext stripper tests."""
from __future__ import annotations

from app.wikitext import strip_wikitext


def test_empty_input():
    assert strip_wikitext("") == ""
    assert strip_wikitext(None) == ""  # type: ignore[arg-type]


def test_strips_internal_link_displays_target():
    text = "Visit [[Paris]] in spring."
    out = strip_wikitext(text)
    assert "Paris" in out
    assert "[" not in out and "]" not in out


def test_internal_link_with_alias_uses_alias():
    out = strip_wikitext("She writes for [[The New York Times|the Times]].")
    assert "the Times" in out
    assert "|" not in out


def test_drops_file_and_category_links():
    text = (
        "Intro paragraph.\n"
        "[[File:Cat.jpg|thumb|A cat]]\n"
        "[[Category:Animals]]\n"
        "Outro paragraph."
    )
    out = strip_wikitext(text)
    assert "Intro" in out and "Outro" in out
    assert "File:" not in out
    assert "Category:" not in out


def test_drops_ref_tags():
    text = "Sallie is loyal.<ref>citation here</ref> She is direct."
    out = strip_wikitext(text)
    assert "loyal" in out and "direct" in out
    assert "citation" not in out
    assert "<ref" not in out


def test_drops_self_closing_ref():
    text = "Statement.<ref name='x'/> Next sentence."
    out = strip_wikitext(text)
    assert "<ref" not in out


def test_drops_html_tags():
    text = "Plain <b>bold</b> and <i>italic</i> text."
    out = strip_wikitext(text)
    assert "<b>" not in out and "<i>" not in out
    assert "bold" in out and "italic" in out


def test_drops_tables_wholesale():
    text = (
        "Before table.\n"
        "{| class='wikitable'\n"
        "|-\n"
        "! Header 1 !! Header 2\n"
        "|-\n"
        "| Cell A || Cell B\n"
        "|}\n"
        "After table."
    )
    out = strip_wikitext(text)
    assert "Before table." in out
    assert "After table." in out
    assert "Cell A" not in out


def test_drops_section_headings():
    text = "Lead paragraph.\n\n== History ==\n\nIt happened."
    out = strip_wikitext(text)
    assert "History" not in out
    assert "Lead paragraph" in out
    assert "It happened" in out


def test_collapses_whitespace():
    text = "Word1     word2\n\n\n\nword3"
    out = strip_wikitext(text)
    assert "     " not in out
    assert "\n\n\n" not in out


def test_template_dropped():
    text = "{{Infobox person|name=Alice|born=1990}} Alice was a person."
    out = strip_wikitext(text)
    assert "Alice was a person." in out
    # Template should not leak its parameters
    assert "Infobox" not in out
    assert "born=1990" not in out
