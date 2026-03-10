package com.jaya.util.validation;

import com.jaya.common.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("CategoryValidator Unit Tests")
class CategoryValidatorTest {

    private CategoryValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CategoryValidator();
    }

    // =========================================================================
    // validateName
    // =========================================================================

    @Nested
    @DisplayName("validateName")
    class ValidateName {

        @Test
        @DisplayName("valid name passes")
        void validName_passes() {
            assertThatCode(() -> validator.validateName("Food")).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("single character name passes")
        void singleCharName_passes() {
            assertThatCode(() -> validator.validateName("A")).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("100 character name passes")
        void maxLengthName_passes() {
            assertThatCode(() -> validator.validateName("A".repeat(100))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("blank name throws ValidationException")
        void blankName_throws() {
            assertThatThrownBy(() -> validator.validateName("   "))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("null name throws ValidationException")
        void nullName_throws() {
            assertThatThrownBy(() -> validator.validateName(null))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("empty name throws ValidationException")
        void emptyName_throws() {
            assertThatThrownBy(() -> validator.validateName(""))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("name exceeding 100 chars throws ValidationException")
        void nameTooLong_throws() {
            assertThatThrownBy(() -> validator.validateName("A".repeat(101)))
                    .isInstanceOf(ValidationException.class);
        }
    }

    // =========================================================================
    // validateType
    // =========================================================================

    @Nested
    @DisplayName("validateType")
    class ValidateType {

        @Test
        @DisplayName("income type passes")
        void incomeType_passes() {
            assertThatCode(() -> validator.validateType("income")).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("expense type passes")
        void expenseType_passes() {
            assertThatCode(() -> validator.validateType("expense")).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("transfer type passes")
        void transferType_passes() {
            assertThatCode(() -> validator.validateType("transfer")).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("invalid type throws ValidationException")
        void invalidType_throws() {
            assertThatThrownBy(() -> validator.validateType("savings"))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("null type throws ValidationException")
        void nullType_throws() {
            assertThatThrownBy(() -> validator.validateType(null))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("blank type throws ValidationException")
        void blankType_throws() {
            assertThatThrownBy(() -> validator.validateType(""))
                    .isInstanceOf(ValidationException.class);
        }
    }

    // =========================================================================
    // validateDescription
    // =========================================================================

    @Nested
    @DisplayName("validateDescription")
    class ValidateDescription {

        @Test
        @DisplayName("null description passes (optional field)")
        void nullDescription_passes() {
            assertThatCode(() -> validator.validateDescription(null)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("500 character description passes")
        void maxLengthDescription_passes() {
            assertThatCode(() -> validator.validateDescription("A".repeat(500))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("description over 500 chars throws ValidationException")
        void descriptionTooLong_throws() {
            assertThatThrownBy(() -> validator.validateDescription("A".repeat(501)))
                    .isInstanceOf(ValidationException.class);
        }
    }

    // =========================================================================
    // validateIcon
    // =========================================================================

    @Nested
    @DisplayName("validateIcon")
    class ValidateIcon {

        @Test
        @DisplayName("null icon passes (optional field)")
        void nullIcon_passes() {
            assertThatCode(() -> validator.validateIcon(null)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("50 character icon passes")
        void maxLengthIcon_passes() {
            assertThatCode(() -> validator.validateIcon("A".repeat(50))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("icon over 50 chars throws ValidationException")
        void iconTooLong_throws() {
            assertThatThrownBy(() -> validator.validateIcon("A".repeat(51)))
                    .isInstanceOf(ValidationException.class);
        }
    }

    // =========================================================================
    // validateColor
    // =========================================================================

    @Nested
    @DisplayName("validateColor")
    class ValidateColor {

        @Test
        @DisplayName("null color passes (optional field)")
        void nullColor_passes() {
            assertThatCode(() -> validator.validateColor(null)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("20 character color passes")
        void maxLengthColor_passes() {
            assertThatCode(() -> validator.validateColor("A".repeat(20))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("color over 20 chars throws ValidationException")
        void colorTooLong_throws() {
            assertThatThrownBy(() -> validator.validateColor("A".repeat(21)))
                    .isInstanceOf(ValidationException.class);
        }
    }

    // =========================================================================
    // validateUserId
    // =========================================================================

    @Nested
    @DisplayName("validateUserId")
    class ValidateUserId {

        @Test
        @DisplayName("positive userId passes")
        void positiveUserId_passes() {
            assertThatCode(() -> validator.validateUserId(1)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("zero userId passes (global user)")
        void zeroUserId_passes() {
            assertThatCode(() -> validator.validateUserId(0)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("null userId throws ValidationException")
        void nullUserId_throws() {
            assertThatThrownBy(() -> validator.validateUserId(null))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("negative userId throws ValidationException")
        void negativeUserId_throws() {
            assertThatThrownBy(() -> validator.validateUserId(-1))
                    .isInstanceOf(ValidationException.class);
        }
    }

    // =========================================================================
    // isValidType
    // =========================================================================

    @Nested
    @DisplayName("isValidType")
    class IsValidType {

        @Test
        @DisplayName("income returns true")
        void income_returnsTrue() {
            assertThatCode(() -> {
                boolean result = validator.isValidType("income");
                assert result;
            }).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("invalid type returns false")
        void invalidType_returnsFalse() {
            assertThatCode(() -> {
                boolean result = validator.isValidType("random");
                assert !result;
            }).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("null returns false")
        void nullType_returnsFalse() {
            assertThatCode(() -> {
                boolean result = validator.isValidType(null);
                assert !result;
            }).doesNotThrowAnyException();
        }
    }

    // =========================================================================
    // validateForCreation
    // =========================================================================

    @Nested
    @DisplayName("validateForCreation")
    class ValidateForCreation {

        @Test
        @DisplayName("valid creation args pass")
        void validArgs_passes() {
            assertThatCode(() -> validator.validateForCreation(
                    "Food", "expense", "Optional description", "icon", "#FF0000"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("null description and icon pass (optional)")
        void nullOptionalFields_passes() {
            assertThatCode(() -> validator.validateForCreation(
                    "Food", "expense", null, null, null))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("blank name throws")
        void blankName_throws() {
            assertThatThrownBy(() -> validator.validateForCreation(
                    "", "expense", null, null, null))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("invalid type throws")
        void invalidType_throws() {
            assertThatThrownBy(() -> validator.validateForCreation(
                    "Food", "savings", null, null, null))
                    .isInstanceOf(ValidationException.class);
        }
    }

    // =========================================================================
    // validateForUpdate
    // =========================================================================

    @Nested
    @DisplayName("validateForUpdate")
    class ValidateForUpdate {

        @Test
        @DisplayName("all null args pass (partial update)")
        void allNull_passes() {
            assertThatCode(() -> validator.validateForUpdate(null, null, null, null, null))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("valid update args pass")
        void validArgs_passes() {
            assertThatCode(() -> validator.validateForUpdate(
                    "New Name", "income", "New desc", "new-icon", "#0000FF"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("non-null invalid name throws")
        void invalidName_throws() {
            assertThatThrownBy(() -> validator.validateForUpdate(
                    "", "income", null, null, null))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("non-null invalid type throws")
        void invalidType_throws() {
            assertThatThrownBy(() -> validator.validateForUpdate(
                    null, "bad_type", null, null, null))
                    .isInstanceOf(ValidationException.class);
        }
    }
}
